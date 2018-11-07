﻿import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {

  @Input() showTime: boolean = true;
  @Input() min: Date = new Date();
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  timeS = '--:--';

  @Input() _selectedMoment: Date = new Date();

    //New
  @Input() showTwoCalender: boolean = false;
  @Input() showTime_2ndCal: boolean = true;
  @Input() min_2ndCal: Date = new Date();
  @Input() _selectedMoment_2ndCal: Date = new Date();
  @Output() onUpdate_2ndCal: EventEmitter<any> = new EventEmitter();
  

  constructor() {
  }

  set selectedMoment(newMoment: Date){
    this._selectedMoment = newMoment;
    this.onUpdate.emit(this._selectedMoment);
    console.log('[Date-Time Moment]: ', this._selectedMoment);
  }

  get selectedMoment(){
    return this._selectedMoment;
  }


  set selectedMomentt_2ndCal(newMoment: Date) {
      this._selectedMoment_2ndCal = newMoment;
      this.onUpdate_2ndCal.emit(this._selectedMoment_2ndCal);
      console.log('[Date-Time Moment]: ', this._selectedMoment_2ndCal);
  }

  get selectedMoment_2ndCal() {
      return this._selectedMoment_2ndCal;
  }

  ngOnInit() {
    console.log('[Date-Time Debug]: ', 'Date-Time where at');
    this._selectedMoment.setMinutes(this._selectedMoment.getMinutes()+1)
    this.min.setMinutes(this.min.getMinutes()+1)
    this.onUpdate.emit(this._selectedMoment);


    console.log('[Date-Time Debug]: ', 'Date-Time where at');
    this._selectedMoment_2ndCal.setMinutes(this._selectedMoment_2ndCal.getMinutes() + 1)
    this.min_2ndCal.setMinutes(this.min_2ndCal.getMinutes() + 1)
    this.onUpdate_2ndCal.emit(this._selectedMoment_2ndCal);
  }
}
