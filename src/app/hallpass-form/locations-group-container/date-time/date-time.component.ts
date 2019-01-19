import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit {

  @Input() isStaff: boolean;

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

}
