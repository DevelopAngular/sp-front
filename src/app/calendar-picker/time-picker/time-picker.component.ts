import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  @Input() currentDate: moment.Moment = moment();

  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  public hovered: boolean;

  private interval = [];

  constructor() { }

  ngOnInit() {
    this.timeResult.emit(this.currentDate);
  }

  changeTime(action, up) {
      if (up === 'up') {
          this.currentDate = moment(this.currentDate).add(1, action);
      } else if (up === 'down') {
          this.currentDate = moment(this.currentDate).subtract(1, action);
      }
      this.timeResult.emit(this.currentDate);
  }

  destroy() {
    this.interval.forEach(id => {
      clearInterval(id);
    });
  }
}
