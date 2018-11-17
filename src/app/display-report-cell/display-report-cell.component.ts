import { Component, OnInit, Input} from '@angular/core';
import { Report } from '../models/Report';

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

  constructor() { }

  ngOnInit() {
  }

  printReport() {
      console.log("Report");
  }

}
