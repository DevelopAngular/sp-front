import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-ios-calendar',
  templateUrl: './ios-calendar.component.html',
  styleUrls: ['./ios-calendar.component.scss']
})
export class IosCalendarComponent implements OnInit {

  date: Moment;
  hour: number;
  minute: number;
  selected: Moment;

  constructor() { }


  ngOnInit() {
  }

}
