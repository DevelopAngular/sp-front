import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as _ from  'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {IosDateSingleton, SWIPE_BLOCKER} from './ios-date.singleton';

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

  constructor(
    private iosDate: IosDateSingleton
  ) { }


  ngOnInit() {
    // this.date = moment();
    this.iosDate
      .getDate()
      .subscribe((d: Moment) => {
        this._date = d;
        this._selected = d;
      });
  }

  getDate(): moment.Moment {
    return this._date;
  }

  getSelected(): moment.Moment {
    // console.log(this._hour, this._half);

    if (this._half === 'PM' && this._hour < 12) {
      this._hour += 12;
    } else if (this._half === 'AM' && this._hour >= 12) {
      this._hour -= 12;
    }

    this._date.hour(this._hour);
    this._date.minute(this._minute);
    // console.log(this._date.valueOf());
    if (this._date.valueOf() < this._minDate.valueOf()) {
      // console.log(true);
      SWIPE_BLOCKER
        .next(true);
    } else {
      // console.log(false);
      SWIPE_BLOCKER
        .next(false);
      // this._selected = this._date;
    }
    this._selected = _.cloneDeep( this._date);
    return this._selected;
  }

  setHalf(value: 'AM' | 'PM') {
    this._half = value;
    this.iosDate.setDate(this.getSelected());
    this.selectedEvent.emit([this.getSelected()]);
  }

  setMinute(value: number) {
    this._minute = value;
    this.iosDate.setDate(this.getSelected());
    this.selectedEvent.emit([this.getSelected()]);
  }

  setHour(value: number) {
    this._hour = value;
    this.iosDate.setDate(this.getSelected());
    this.selectedEvent.emit([this.getSelected()]);
  }

  setDate(value: moment.Moment) {
    this._date = value;
    this.iosDate.setDate(this.getSelected());
    this.selectedEvent.emit([this.getSelected()]);
  }
}
