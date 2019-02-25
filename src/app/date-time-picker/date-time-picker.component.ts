﻿import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Util } from '../../Util';
import { TimeService } from '../services/time.service';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit, OnDestroy{

  @Input() showTime: boolean = true;
  @Input() min: Date;
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  timeS = '--:--';

  @Input() _selectedMoment: Date = null;

    //New
  @Input() showTwoCalender: boolean = false;
  @Input() showTime_2ndCal: boolean = true;
  @Input() min_2ndCal: Date = null;
  @Input() _selectedMoment_2ndCal: Date = null;
  @Output() onUpdate_2ndCal: EventEmitter<any> = new EventEmitter();

  @Output() onconfirm: EventEmitter<any> = new EventEmitter();

  @Input() default: Date;

  constructor(private timeService: TimeService) {
    const now = this.timeService.nowDate();
    if (this._selectedMoment === null) {
      this._selectedMoment = now;
    }
    if (this.min_2ndCal === null) {
      this.min_2ndCal = null;
    }
    if (this._selectedMoment_2ndCal === null) {
      this._selectedMoment_2ndCal = now;
    }
  }

  set selectedMoment(newMoment: Date) {
    newMoment.setSeconds(0);
    let nhrs = newMoment.getHours();
    let nmins = newMoment.getMinutes();
    let ohrs = this.default.getHours();
    let omins = this.default.getMinutes();

    let invalid = false;
    if (this.min) {
      if (newMoment.getDate() == this.min.getDate() && newMoment.getMonth() == this.min.getMonth()) {
          invalid = (nhrs < ohrs) || (nhrs == ohrs && nmins < omins);
      }
    }


    if (invalid) {
      this._selectedMoment = this.default;
      console.log('Time Invalid');
    } else{
      this._selectedMoment = newMoment;
      console.log('Time Valid');
    }

    this.ngOnDestroy();
    console.log('[Date-Time Moment]: ', this._selectedMoment);
  }

  get selectedMoment() {
    return this._selectedMoment;
  }


  set selectedMoment_2ndCal(newMoment: Date) {
    newMoment.setSeconds(0);
    this._selectedMoment_2ndCal = newMoment;
    this.onUpdate_2ndCal.emit(this._selectedMoment_2ndCal);
    console.log('[Date-Time Moment]: ', this._selectedMoment_2ndCal);
  }

  get selectedMoment_2ndCal() {
      return this._selectedMoment_2ndCal;
  }

  get dateRangeText() {
    if (this._selectedMoment) {
      return Util.formatDateTimeForDateRange(this._selectedMoment, this._selectedMoment_2ndCal);
    }
  }

  ngOnInit() {
    console.log('[Date-Time Debug]: ', 'Date-Time where at');
    if (this.min && this.min instanceof Date) {
      this.min.setSeconds(0);
      this.min.setMinutes(0);
      this.min.setHours(0);
    }
    if (this._selectedMoment) {
      this._selectedMoment.setMinutes(this._selectedMoment.getMinutes() + 5);
      this._selectedMoment.setSeconds(0);
      this.default = this._selectedMoment;
    }
    if (!this._selectedMoment) {
      this._selectedMoment = this.default;
    }

    // this.onUpdate.emit(this._selectedMoment);

    console.log('[Date-Time Debug]: ', this._selectedMoment);
    if (this._selectedMoment_2ndCal && this.min_2ndCal) {
      this._selectedMoment_2ndCal.setMinutes(this._selectedMoment_2ndCal.getMinutes() + 1);
      this.min_2ndCal.setMinutes(this.min_2ndCal.getMinutes() + 1);
      this.onUpdate_2ndCal.emit(this._selectedMoment_2ndCal);
    }
  }
  ngOnDestroy() {
    this.onUpdate.emit(this._selectedMoment);
  }
  confirmDates() {
    this.onconfirm.emit(this.dateRangeText);
  }
}
