import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {Subject, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnDestroy {

  @Input() currentDate: moment.Moment = moment();

  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  public hourHovered: boolean;
  public minHovered: boolean;

  timeForm: FormGroup;

  destroy$ = new Subject();

  constructor() { }

  ngOnInit() {
    this.buildFrom();
    timer(50).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.timeResult.emit(this.currentDate);
    });
  }

  buildFrom() {
      this.timeForm = new FormGroup({
          hour: new FormControl(this.currentDate.format('hh')),
          minute: new FormControl(this.currentDate.format('mm'))
      });
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  changeTime(action, up) {
      if (up === 'up') {
          this.currentDate = moment(this.currentDate).add(1, action);
      } else if (up === 'down') {
          this.currentDate = moment(this.currentDate).subtract(1, action);
      }
      this.buildFrom();
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
      this.buildFrom();
      this.timeResult.emit(this.currentDate);
  }

  destroy(action, up) {
    return;
  }
}
