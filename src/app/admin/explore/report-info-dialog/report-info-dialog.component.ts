import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';

import {Report} from '../../../models/Report';
import {PdfGeneratorService} from '../../pdf-generator.service';

import * as moment from 'moment';
import {takeUntil} from 'rxjs/operators';

declare const window;

@Component({
  selector: 'app-report-info-dialog',
  templateUrl: './report-info-dialog.component.html',
  styleUrls: ['./report-info-dialog.component.scss']
})
export class ReportInfoDialogComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;

  report: Report;
  showBottomShadow: boolean = true;

  pdfUrl: string;

  destroy$: Subject<any> = new Subject<any>();

  @HostListener('document:scroll', ['$event'])
  scroll(event) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.showBottomShadow = false;
    } else {
      this.showBottomShadow = true;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReportInfoDialogComponent>,
    private pdfService: PdfGeneratorService
  ) { }

  get dateFormat() {
    return moment(this.report.created).format('MMM DD, YYYY') + ' at ' + moment(this.report.created).format('hh:mm A');
  }

  ngOnInit(): void {
    this.report = this.data['report'];
    this.generatePDF();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close() {
    this.dialogRef.close();
  }

  generatePDF() {
    const report = {
      created: this.dateFormat,
      issuer: this.report.issuer.display_name,
      message: this.report.message,
      student_name: this.report.student.display_name + ` (${this.report.student.primary_email})`
    };
    Object.defineProperty(report, 'date', {enumerable: false, value: this.report.created});
    this.pdfService.generateReport(report as any, 'p', 'explore')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      this.pdfUrl = this.pdfService.pdfUrl;
    });
  }

  openPdfLink() {
    window.open(this.pdfUrl, '_blank');
  }

}
