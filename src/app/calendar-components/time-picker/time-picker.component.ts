import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnDestroy {

  @Input() currentDate: moment.Moment = moment().add(5, 'minutes');

  @Input() min: moment.Moment;

  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  public hourHovered: boolean;
  public minHovered: boolean;

  timeForm: FormGroup;

  destroy$ = new Subject();

  constructor() { }

  get isDisabledSwitchHourButton() {
    return this.min && moment(this.currentDate).isSameOrBefore(this.min, 'hour');
  }

  get isDisabledSwitchMinButton() {
    return this.min && moment(this.currentDate).isSameOrBefore(moment(this.min).add(5, 'minutes'), 'minute');
  }

  ngOnInit() {
    this.buildFrom();
    timer(50).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.timeResult.emit(this.currentDate);
    });
    this.timeForm.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(value => {
            if (this.currentDate.format('A') === 'PM') {
              this.currentDate = this.currentDate.set('hour', +value.hour + 12);
            } else {
              this.currentDate = this.currentDate.set('hour', value.hour);
            }
            this.currentDate = this.currentDate.set('minute', value.minute);
            if (this.currentDate.isBefore(moment().add(5, 'minutes'))) {
                this.currentDate = moment().add(5, 'minutes');
            }
        });
  }

  buildFrom() {
      this.timeForm = new FormGroup({
          hour: new FormControl(this.currentDate.format('hh')),
          minute: new FormControl(this.currentDate.format('mm'))
      });
  }

  updateDate() {
      this.timeForm.get('hour').setValue(this.currentDate.format('hh'));
      this.timeForm.get('minute').setValue(this.currentDate.format('mm'));
      this.timeResult.emit(this.currentDate);
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
}
