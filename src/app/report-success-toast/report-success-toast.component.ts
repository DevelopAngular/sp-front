import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-report-success-toast',
  templateUrl: './report-success-toast.component.html',
  styleUrls: ['./report-success-toast.component.scss']
})
export class ReportSuccessToastComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ReportSuccessToastComponent>
  ) { }

  ngOnInit() {
    setTimeout(() => this.dialogRef.close(), 1500);
  }

}
