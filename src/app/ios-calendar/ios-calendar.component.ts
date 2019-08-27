import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-ios-calendar',
  templateUrl: './ios-calendar.component.html',
  styleUrls: ['./ios-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class IosCalendarComponent implements OnInit {

  @Output() selectedEvent: EventEmitter<Moment[]> = new EventEmitter<Moment[]>();

  private _minDate: Moment = moment().add(5, 'minutes');

  private _date: Moment;
  private _hour: number;
  private _minute: number;
  private _half: 'AM' | 'PM';
  private _selected: Moment;

  constructor() { }


  ngOnInit() {
    this.date = moment();
  }

  get date(): moment.Moment {
    return this._date;
  }

  get selected(): moment.Moment {
    if (this._half === 'AM') {
      this._date.hour(this._hour);

    } else if (this._half === 'PM') {
      this._date.hour(this._hour + 12);
    }
    // this._date.hour(this._hour);
    this._date.minute(this._minute);
    this._selected = this._date;

    return this._selected;
  }

  set half(value: 'AM' | 'PM') {
    this._half = value;
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
