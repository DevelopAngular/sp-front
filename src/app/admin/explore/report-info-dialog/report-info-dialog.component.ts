import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Report} from '../../../models/Report';
import {Subject} from 'rxjs';

import * as moment from 'moment';
import {PdfGeneratorService} from '../../pdf-generator.service';

@Component({
  selector: 'app-report-info-dialog',
  templateUrl: './report-info-dialog.component.html',
  styleUrls: ['./report-info-dialog.component.scss']
})
export class ReportInfoDialogComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;

  report: Report;
  showBottomShadow: boolean = true;

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
    return moment(this.report.created).format('HH:mm A on MMM DD, YYYY');
  }

  ngOnInit(): void {
    this.report = this.data['report'];
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
      student_name: this.report.student.display_name + `(${this.report.student.primary_email})`
    };
    this.pdfService.generateReport(report as any, 'p', 'hallmonitor');
  }

}
