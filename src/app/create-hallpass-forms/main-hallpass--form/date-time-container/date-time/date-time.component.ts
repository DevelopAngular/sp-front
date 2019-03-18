import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TimeService } from '../../../../services/time.service';
import { Navigation } from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';

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
  @Output() backButton: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  startTime: Date = undefined;
  requestTime: Date = undefined;
  declinable: FormControl = new FormControl(true);

  constructor(private timeService: TimeService, private formService: CreateFormService) {
    const now = this.timeService.nowDate();
    if (this.startTime === undefined) {
      this.startTime = now;
    }
    if (this.requestTime === undefined) {
      this.requestTime = now;
    }
  }

  ngOnInit() {
    if (this.mock) {
      this.requestTime = this.timeService.nowDate();
      this.declinable = new FormControl(true);
    } else {
      if (this.formState.data.date) {
        this.requestTime = new Date(this.formState.data.date.date);
        this.declinable.setValue(this.formState.data.date.declinable);
      }
    }

  }

  next() {
    this.formState.data.date = {
      date: this.requestTime,
      declinable: this.declinable.value
    };
    setTimeout(() => {
      this.result.emit(this.formState);
    }, 100);
  }

  back() {

    this.formService.setFrameMotionDirection('back');


    setTimeout(() => {
      if (this.isStaff) {
        this.formState.step = 2;
      } else {
        this.formState.step = 0;
      }
      console.log('AaA ===>>>', event);
      this.backButton.emit(this.formState);
    }, 100);




  }

}
