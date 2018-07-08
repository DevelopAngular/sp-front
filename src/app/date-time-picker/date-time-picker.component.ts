import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {

  @Input()
  dateCtrl: FormControl = new FormControl();

  @Input()
  timeCtrl: FormControl = new FormControl();

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  timeS = '--:--';

  min: Date = new Date();

  public _selectedMoment: Date = new Date();
  // selectedTime: Date;

  constructor(private atp: AmazingTimePickerService) {
  }

  set selectedMoment(newMoment: Date){
    this._selectedMoment = newMoment;
    this.onUpdate.emit(this._selectedMoment);
    console.log('[Date-Time Moment]: ', this._selectedMoment);
  }

  get selectedMoment(){
    return this._selectedMoment;
  }

  ngOnInit() {
    console.log('[Date-Time Debug]: ', 'Date-Time where at');
    this._selectedMoment.setMinutes(this._selectedMoment.getMinutes()+1)
    this.min.setMinutes(this.min.getMinutes()+1)
    this.onUpdate.emit(this._selectedMoment);
  }

  updateDate(date: MatDatepickerInputEvent<Date>) {
    // this.selectedDate = date.value;
    this.updateDateTime();
  }

  updateTime(time: Date) {
    // this.selectedTime = time;
    this.updateDateTime();
  }

  updateDateTime() {
    // if (this.selectedDate && this.selectedTime) {
      // this.onUpdate.emit(this.dateTime(this.selectedDate, this.selectedTime));
    // }
  }

  dateTime(dateD: Date, timeD: Date) {
    return dateD.toISOString().split('T')[0] + 'T' + timeD.toISOString().split('T')[1];
  }

  openTime() {
    const amazingTimePicker = this.atp.open({
      theme: 'light',
      locale: 'en-us',
      arrowStyle: {
        background: 'green',
        color: 'white'
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.timeS = time;
      const split = time.split(':');
      const hrs = split[0];
      const mins = split[1];
      const timeD: Date = new Date;
      timeD.setHours(parseInt(hrs, 10));
      timeD.setMinutes(parseInt(mins, 10));
      this.updateTime(timeD);
    });
  }

}
