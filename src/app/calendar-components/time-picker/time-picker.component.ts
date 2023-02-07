import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

/**
 * This component was lightly refactored to cater for a simple bug fix.
 * Ideally, we should come back to this component and do more refactoring and
 * limit the domain. This component should also be heavily tested.
 *
 * This is a time-picker component, it shouldn't care about the day of the week or
 * the month. At the very least, the component should:
 * - accept a date
 * - output the same date with the updated time
 * - validate any hour and minute UI inputs
 * We could go a stretch further and accept a minimum date but this can also be
 * validated by the consumer of this component's output.
 *
 * Some UI considerations would be to set up appropriate listeners for web and
 * PWA environments. This is already mostly done but refactored code should not
 * affect this.
 */
@Component({
	selector: 'app-time-picker',
	templateUrl: './time-picker.component.html',
	styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent implements OnInit, OnDestroy {
	@Input() min: moment.Moment;
	@Input() forseDate$: Subject<moment.Moment>;
  @Input() set currentDate(mDate) {
    this._currentDate = moment(mDate);
  }
  @Output() timeResult: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();
	@ViewChild('hourInp') hourInput: ElementRef;

	public hourHovered: boolean;
	public minHovered: boolean;

	upInterval: number;
	downInterval: number;
	_currentDate: moment.Moment;

	timeForm: FormGroup;
	destroy$ = new Subject();

	constructor() {}

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
			this.forseDate$.pipe(takeUntil(this.destroy$)).subscribe((date) => {
				this._currentDate = date;
				this.buildFrom();
			});
		}
		this.buildFrom();
		timer(50)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.timeResult.emit(this._currentDate);
			});
	}

	buildFrom() {
		this.timeForm = new FormGroup({
			hour: new FormControl(this._currentDate.format('hh')),
			minute: new FormControl(this._currentDate.format('mm')),
		});
	}

  private refresh() {
    this.buildFrom();
    this.timeResult.emit(this._currentDate);
  }

  updateMinute() {
    let parsedMinute = parseInt(this.timeForm?.value?.minute);
    if (Number.isNaN(parsedMinute)) {
      // since this is a text input, the user can enter stuff like "ff"
      // invalid inputs should be reverted back to the current minute
      parsedMinute = this._currentDate.minute();
    }

    // the user should not be allowed to enter a value greater than 59 or less than 0
    this._currentDate = this._currentDate.set('minute', Math.abs(parsedMinute) % 60);
    this.refresh();
  }

  updateHour() {
    let parsedHour = parseInt(this.timeForm?.value?.hour);
    if (Number.isNaN(parsedHour)) {
      // since this is a text input, the user can enter stuff like "ff"
      // invalid inputs should be reverted back to the current hour
      parsedHour = this._currentDate.hour();
      this._currentDate = this._currentDate.set('hour', parsedHour);
      this.refresh();
      return;
    }

    // if a person enters something stupid like 25 and the time is set to PM, modding would account for that
    parsedHour = parsedHour % 12;
    const AMPM: string = this._currentDate.format('A');
    if (AMPM === 'PM') {
      // we should add 12 to the input number, only if the hour isn't 12
      // If adding 12 gives a number higher than 24, mod it
      parsedHour = (parsedHour === 12 ? 12 : parsedHour + 12) % 24;
    }
    this._currentDate = this._currentDate.set('hour', Math.abs(parsedHour) % 24);
    this.refresh();
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
		this.refresh();
	}

	changeTime(action, up) {
		if (up === 'up') {
			this.upInterval = setInterval(() => {
        this._currentDate = this._currentDate.add(1, action);
				this.buildFrom();
				this.timeResult.emit(this._currentDate);
			}, 200);
		} else if (up === 'down') {
			this.downInterval = setInterval(() => {
				if ((action === 'hours' && this.isDisabledSwitchHourButton) || (action === 'minutes' && this.isDisabledSwitchMinButton)) {
					this.destroyInterval(action, up);
					return;
				}
        this._currentDate = this._currentDate.subtract(1, action);
				this.buildFrom();
				this.timeResult.emit(this._currentDate);
			}, 200);
		}
	}

	destroyInterval(action, direction: 'up' | 'down') {
		if (direction === 'up') {
			clearInterval(this.upInterval);
		} else if (direction === 'down') {
			clearInterval(this.downInterval);
		}
	}

	changeFormat() {
		const today = this._currentDate.clone().startOf('day');
		const hoursInDaySoFar = this._currentDate.diff(today, 'hour');
		const cloneDate = this._currentDate.clone();
		const newDate = hoursInDaySoFar >= 12 ? cloneDate.subtract(12, 'hour') : cloneDate.add(12, 'hour');

		// switching the format will cause the date to be invalid, so don't change it
		if (newDate.isBefore(moment().add(5, 'minutes'))) {
			return;
		}

		this._currentDate = newDate;
		this.refresh();
	}
}
