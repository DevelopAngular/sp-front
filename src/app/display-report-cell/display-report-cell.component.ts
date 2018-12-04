import { Component, OnInit, Input} from '@angular/core';
import { Report } from '../models/Report';
import {PdfGeneratorService} from '../admin/pdf-generator.service';

@Component({
  selector: 'app-display-report-cell',
  templateUrl: './display-report-cell.component.html',
  styleUrls: ['./display-report-cell.component.scss']
})
export class DisplayReportCellComponent implements OnInit {

    @Input() hasDivider: boolean = true;
    @Input() student_name: string;
    @Input() righticon: string;
    @Input() created: string
    @Input() message: string;
    @Input() issuer: string;
    @Input() reportData: Report[] = [];

    private data: any;

  constructor(
    private pdf: PdfGeneratorService
  ) { }

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
      created: prettyReportDate,
      message: this.message,
      issuer: this.issuer,
    }
    console.log(this.data);
  }
  printReport() {
    this.pdf.generate(this.data, [], 'p', 'hallmonitor');
  }
}
