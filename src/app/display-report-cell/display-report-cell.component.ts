import { Component, OnInit, Input } from '@angular/core';
import { Report } from '../models/Report';
import { PdfGeneratorService } from '../admin/pdf-generator.service';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-display-report-cell',
  templateUrl: './display-report-cell.component.html',
  styleUrls: ['./display-report-cell.component.scss']
})
export class DisplayReportCellComponent implements OnInit {

    @Input() hasDivider: boolean = true;
    @Input() student_name: string;
    @Input() righticon: string;
    @Input() created: string;
    @Input() message: string;
    @Input() issuer: string;
    @Input() reportData: Report[] = [];

    private data: any;

  constructor(
    private pdf: PdfGeneratorService,
    public darkTheme: DarkThemeSwitch
  ) { }

  get color() {
    return this.darkTheme.getColor({white: '#7f879d', dark: '#FFFFFF'});
  }
  get icon() {
    return this.darkTheme.getIcon({
      iconName: this.righticon,
      darkFill: 'White',
      lightFill: 'Blue-Gray'
    });
  }

  ngOnInit() {

    const reportDate = new Date(this.created);
    const time = reportDate.getHours() < 12
      ?
      `${reportDate.getHours()}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} AM`
      :
      `${reportDate.getHours() - 12}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} PM`;
    const prettyReportDate = `${reportDate.getMonth() + 1}/${reportDate.getDate()}  ${time}`;

    this.data = {
      student_name: this.student_name,
      created: this.created,
      message: this.message,
      issuer: this.issuer,
    };
  }

  printReport(e) {
    // e.preventDefault();

    this.pdf.generateReport(this.data, 'p', 'hallmonitor');

  }
}
