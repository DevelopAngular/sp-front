import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-picker-test',
  templateUrl: './calendar-picker-test.component.html',
  styleUrls: ['./calendar-picker-test.component.scss']
})
export class CalendarPickerTestComponent implements OnInit {

  selected1 = moment('2019-04-18');
  selected2 = moment('2019-04-22');

  constructor() { }

  ngOnInit() {
  }

}
