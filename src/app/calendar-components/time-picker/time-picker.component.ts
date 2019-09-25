import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { merge, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnDestroy {

  @Input() set currentDate(mDate) {
      this._currentDate = moment(mDate);
  }

  @Input() min: moment.Moment;

  @Input() forseDate$: Subject<moment.Moment>;

  @ViewChild('hourInp') hourInput: ElementRef;

  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  public hourHovered: boolean;
  public minHovered: boolean;
  private isUpdateTime: boolean;

  upInterval;
  downInterval;

  _currentDate: moment.Moment;

  timeForm: FormGroup;
  changeEmit$: Subject<{hour: string, minute: string}> = new Subject<{hour: string, minute: string}>();

  destroy$ = new Subject();

  constructor() { }

  get invalidTime() {
      return this._currentDate.isBefore(moment().add(5, 'minutes'));
  }

  get isDisabledSwitchHourButton() {
    return this.min && moment(this._currentDate).isSameOrBefore(this.min, 'hour');
  }

  get isDisabledSwitchMinButton() {
    return this.min && moment(this._currentDate).isSameOrBefore(moment(this.min).add(5, 'minutes'));
  }

  get isDisabledSwitchFormat() {
      const removeTime = moment(this._currentDate).subtract(12, 'hour');
      return removeTime.isBefore(moment().add(5, 'minutes'));
  }

  ngOnInit() {
    if (this.forseDate$) {
        this.forseDate$.pipe(takeUntil(this.destroy$)).subscribe(date => {
            this._currentDate = date;
            this.buildFrom();
        });
    }
    this.buildFrom();
    timer(50).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.timeResult.emit(this._currentDate);
    });
    merge(this.timeForm.valueChanges, this.changeEmit$).pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          if (!this.isUpdateTime) {
            const currentDay = moment(this._currentDate);
            if (this._currentDate.format('A') === 'PM') {
              this._currentDate = this._currentDate.set('hour', +value.hour + 12);

            } else {
              this._currentDate = this._currentDate.set('hour', value.hour);
              if (this.invalidTime) {
                this._currentDate = this._currentDate.set('hour', +value.hour + 12);
                console.log('Current Time ==>>', this._currentDate.format('DD hh:mm A'));
              }
            }
            this._currentDate = this._currentDate.set('minute', value.minute);
            if (this.invalidTime) {
              console.log('Invalid Time ==>>', this._currentDate.format('DD hh:mm A'));
              this._currentDate = moment().add(5, 'minutes');
            }
            this.normalizeDateDay(currentDay, this._currentDate);
          }
        });
  }

  normalizeDateDay(currentDate: moment.Moment, newDate: moment.Moment) {
    if (newDate.isAfter(currentDate, 'day')) {
      this._currentDate.set('date', currentDate.date());
    }
  }

  buildFrom() {
      this.timeForm = new FormGroup({
          hour: new FormControl(this._currentDate.format('hh')),
          minute: new FormControl(this._currentDate.format('mm'))
      });
  }

  updateDate() {
    this.isUpdateTime = true;
    this.timeForm.get('hour').setValue(this._currentDate.format('hh'));
    this.timeForm.get('minute').setValue(this._currentDate.format('mm'));
    this.timeResult.emit(this._currentDate);
    this.isUpdateTime = false;
  }

  change() {
      this.changeEmit$.next(this.timeForm.value);
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  clickChangeTime(action, state) {
      if (state === 'up') {
          this._currentDate.add(1, action);
      } else if (state === 'down') {
          this._currentDate.subtract(1, action);
          if (this.invalidTime) {
              this._currentDate = moment().add(5, 'minutes');
          }
      }
      this.buildFrom();
      this.timeResult.emit(this._currentDate);
  }

  changeTime(action, up) {
          if (up === 'up') {
              this.upInterval = setInterval(() => {
                  this._currentDate.add(1, action);
                  this.buildFrom();
                  this.timeResult.emit(this._currentDate);
              }, 200);
          } else if (up === 'down') {
              this.downInterval = setInterval(() => {
                  if ((action === 'hours' && this.isDisabledSwitchHourButton) || (action === 'minutes' && this.isDisabledSwitchMinButton)) {
                      this.destroyInterval(action, up);
                      return;
                  }
                  this._currentDate.subtract(1, action);
                  this.buildFrom();
                  this.timeResult.emit(this._currentDate);
              }, 200);
          }
  }

  destroyInterval(action, up) {
    if (up === 'up') {
        clearInterval(this.upInterval);
    } else if (up === 'down') {
        clearInterval(this.downInterval);
    }
  }

  changeFormat() {
      if (!this.isDisabledSwitchHourButton && !this.isDisabledSwitchFormat) {
          const addTime = moment(this._currentDate).add(12, 'hour');
          const removeTime = moment(this._currentDate).subtract(12, 'hour');
          if (this._currentDate.isSame(addTime, 'day')) {
              this._currentDate = addTime;
          } else {
              this._currentDate = removeTime;
          }
          this.buildFrom();
          this.timeResult.emit(this._currentDate);
      } else {
          console.log('this invalid Time ====>>>', this._currentDate.format('DD hh:mm A'));
      }
  }
}
