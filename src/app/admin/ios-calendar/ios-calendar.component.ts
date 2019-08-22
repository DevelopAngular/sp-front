import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-ios-calendar',
  templateUrl: './ios-calendar.component.html',
  styleUrls: ['./ios-calendar.component.scss']
})
export class IosCalendarComponent implements OnInit {

  private _date: Moment;
  private _hour: number;
  private _minute: number;
  private _selected: Moment;

  constructor() { }


  ngOnInit() {
    this.date = moment();
  }

  get date(): moment.Moment {
    return this._date;
  }

  get selected(): moment.Moment {
    this._date.hour(this._hour);
    this._date.minute(this._minute);
    this._selected = this._date;

    return this._selected;
  }

  set minute(value: number) {
    this._minute = value;
  }

  set hour(value: number) {
    this._hour = value;
  }

  set date(value: moment.Moment) {
    this._date = value;
  }
}
