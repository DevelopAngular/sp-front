import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnInit {
  toDate: Date;
  fromDate: Date;

  constructor(public dialogRef: MatDialogRef<DateInputComponent>,  @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.toDate = this.data['to'];
    console.log(this.data['to'])
    this.fromDate = this.data['from'];
  }

}
