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

  changeFormat() {
      const addTime = moment(this.currentDate).add(12, 'hour');
      const removeTime = moment(this.currentDate).subtract(12, 'hour');
      if (this.currentDate.isSame(addTime, 'day')) {
          this.currentDate = addTime;
      } else {
          this.currentDate = removeTime;
      }
      this.timeResult.emit(this.currentDate);
  }

  destroy() {
  }
}
