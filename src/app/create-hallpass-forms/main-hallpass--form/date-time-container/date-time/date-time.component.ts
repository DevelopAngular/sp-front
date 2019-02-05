import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Navigation } from '../../main-hall-pass-form.component';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit {

  @Input() mock = null;
  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Output() result: EventEmitter<any> = new EventEmitter<any>();

  startTime: Date = new Date();
  requestTime: Date = new Date();
  declinable: FormControl = new FormControl(true);

  constructor() { }

  ngOnInit() {
    if (this.mock) {
      this.requestTime = new Date();
      this.declinable = new FormControl(true);
    } else {
      if (this.formState.data.date) {
        this.requestTime = new Date(this.formState.data.date.date);
        this.declinable.setValue(this.formState.data.date.declinable);
      }
    }

  }

  next() {
    this.result.emit({
        date: this.requestTime,
        declinable: this.declinable.value
    });
  }

  back() {
    this.result.emit('exit');
  }

}
