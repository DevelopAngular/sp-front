import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {LocationService} from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit {

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Output() result: EventEmitter<any> = new EventEmitter<any>();

  startTime: Date = new Date();
  requestTime: Date = new Date();

  declinable: FormControl;

  constructor() { }

  ngOnInit() {
    this.declinable = new FormControl(false);
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
