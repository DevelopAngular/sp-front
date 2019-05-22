import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
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

  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  public hourHovered: boolean;
  public minHovered: boolean;

  _currentDate: moment.Moment;

  timeForm: FormGroup;
  changeEmit$: Subject<{hour: string, minute: string}> = new Subject<{hour: string, minute: string}>();

  destroy$ = new Subject();

  constructor(private cdr: ChangeDetectorRef) { }

  get isDisabledSwitchHourButton() {
    return this.min && moment(this._currentDate).isSameOrBefore(this.min, 'hour');
  }

  get isDisabledSwitchMinButton() {
    return this.min && moment(this._currentDate).isSameOrBefore(moment(this.min).add(5, 'minutes'), 'minute');
  }

  ngOnInit() {
      // console.log('Timeee ===>>>', this._currentDate.format('DD hh:mm A'));
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
            if (this._currentDate.format('A') === 'PM') {
              this._currentDate = this._currentDate.set('hour', +value.hour + 12);
            } else {
              this._currentDate = this._currentDate.set('hour', value.hour);
            }
            this._currentDate = this._currentDate.set('minute', value.minute);
            if (this._currentDate.isBefore(moment().add(5, 'minutes'))) {
                this._currentDate = moment().add(5, 'minutes');
            }
        });
  }

  buildFrom() {
      this.timeForm = new FormGroup({
          hour: new FormControl(this._currentDate.format('hh')),
          minute: new FormControl(this._currentDate.format('mm'))
      });
  }

  updateDate() {
      this.timeForm.get('hour').setValue(this._currentDate.format('hh'));
      this.timeForm.get('minute').setValue(this._currentDate.format('mm'));
      this.timeResult.emit(this._currentDate);
  }

  change() {
      this.changeEmit$.next(this.timeForm.value);
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  changeTime(action, up) {
        if (up === 'up') {
            this._currentDate.add(1, action);
        } else if (up === 'down') {
            this._currentDate.subtract(1, action);
        }
        this.buildFrom();
        this.timeResult.emit(this._currentDate);
  }

  changeFormat() {
      if (!this.isDisabledSwitchHourButton) {
          const addTime = moment(this._currentDate).add(12, 'hour');
          const removeTime = moment(this._currentDate).subtract(12, 'hour');
          if (this._currentDate.isSame(addTime, 'day')) {
              this._currentDate = addTime;
          } else {
              this._currentDate = removeTime;
          }
          this.buildFrom();
          this.timeResult.emit(this._currentDate);
      }
  }
}
