import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.css']
})
export class DateTimeComponent implements OnInit {
  @Input()
  type:string;
  selectedDate: Date;
  minDate: Date;
  isDate: boolean;
  selectedTime: Date;
  constructor() {}

  ngOnInit() {
    this.isDate = this.type=="'date'";
    this.minDate = new Date();
  }

}
