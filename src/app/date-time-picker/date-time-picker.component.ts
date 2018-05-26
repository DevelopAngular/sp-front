import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})
export class DateTimePickerComponent implements OnInit {

  @Output() onUpdate:EventEmitter<any> = new EventEmitter();

  now:Date = new Date();

  selectedDate:Date;
  selectedTime:Date;

  constructor() { }

  ngOnInit() {

  }

  updateDate(date:MatDatepickerInputEvent<Date>){
    this.selectedDate = date.value;
  }

  updateTime(time:Date){
    this.selectedTime = time;
  }

  updateDateTime(){
    if(this.selectedDate && this.selectedTime)
      this.onUpdate.emit(this.dateTime(this.selectedDate, this.selectedTime));
  }

  dateTime(dateD:Date, timeD:Date){
    return dateD.toISOString().split('T')[0] +'T' +timeD.toISOString().split('T')[1];
  }

}
