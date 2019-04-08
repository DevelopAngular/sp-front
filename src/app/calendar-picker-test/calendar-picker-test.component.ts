import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-picker-test',
  templateUrl: './calendar-picker-test.component.html',
  styleUrls: ['./calendar-picker-test.component.scss']
})
export class CalendarPickerTestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  selectedDates(dates) {
    console.log(dates);
  }

}
