import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnInit {
  toDate: Date;
  fromDate: Date;

  constructor(public dialogRef: MatDialogRef<DateInputComponent>) { }

  ngOnInit() {
  }

}
