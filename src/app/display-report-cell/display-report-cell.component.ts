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
    this.data = {
      hasDivider: this.hasDivider,
      student_name: this.student_name,
      righticon: this.righticon,
      created: this.created,
      message: this.message,
      issuer: this.issuer,
      reportData: this.reportData
    }
    console.log(this.data);
  }

  printReport() {
    this.pdf.generate(this.data, [],'p', 'hallmonitor')
      console.log("Report");
  }

}
