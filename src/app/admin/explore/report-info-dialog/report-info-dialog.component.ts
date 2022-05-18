import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';

import {Report, ReportDataUpdate} from '../../../models/Report';
import {HallPass} from '../../../models/HallPass';
import {PassLike} from '../../../models';
import {ReportUpdateService} from '../../../services/report-update.service';
import {AdminService} from '../../../services/admin.service';
import {TimeService} from '../../../services/time.service';
import {PdfGeneratorService} from '../../pdf-generator.service';

import * as moment from 'moment';
import {takeUntil, switchMap} from 'rxjs/operators';

declare const window;

@Component({
  selector: 'app-report-info-dialog',
  templateUrl: './report-info-dialog.component.html',
  styleUrls: ['./report-info-dialog.component.scss']
})
export class ReportInfoDialogComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;

  report: Report;
  isReportedPassActive: boolean | null = null;
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
    private pdfService: PdfGeneratorService,
    private reportUpdateService: ReportUpdateService,
    private adminService: AdminService,
    private timeService: TimeService,
  ) {}

  get dateFormat() {
    return moment(this.report.created).format('MMM DD, YYYY') + ' at ' + moment(this.report.created).format('hh:mm A');
  }

  ngOnInit(): void {
    this.report = this.data['report'];

    if (this.report.reported_pass_id) {
      const pass = this.report.reported_pass as PassLike;
      if (pass instanceof HallPass) {
        let isActive = false; 
        const now = this.timeService.nowDate();
        isActive = 
          new Date(pass.start_time).getTime() <= now.getTime() && 
          now.getTime() < new Date(pass.end_time).getTime();
        this.isReportedPassActive = isActive;
      }
    }

    this.generatePDF();

    this.reportUpdateService.notifier()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(v => this.updateReport(v)), 
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close() {
    this.dialogRef.close();
  }

  updateReport(updata: ReportDataUpdate) {
    return this.adminService.updateReportRequest(updata);
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
