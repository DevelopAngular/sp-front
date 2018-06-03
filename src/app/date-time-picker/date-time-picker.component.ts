import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})
export class DateTimePickerComponent implements OnInit {

  @Input()
  dateCtrl: FormControl;

  @Input()
  timeCtrl: FormControl;

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  timeS: string = '--:--';

  now: Date = new Date();

  selectedDate: Date;
  selectedTime: Date;

  constructor(private atp: AmazingTimePickerService) {
  }

  ngOnInit() {

  }

  updateDate(date: MatDatepickerInputEvent<Date>) {
    this.selectedDate = date.value;
    this.updateDateTime();
  }

  updateTime(time: Date) {
    this.selectedTime = time;
    this.updateDateTime();
  }

  updateDateTime() {
    if (this.selectedDate && this.selectedTime)
      this.onUpdate.emit(this.dateTime(this.selectedDate, this.selectedTime));
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
      let split = time.split(':');
      let hrs = split[0];
      let mins = split[1];
      let timeD: Date = new Date;
      timeD.setHours(parseInt(hrs));
      timeD.setMinutes(parseInt(mins));
      this.updateTime(timeD);
    });
  }

}
