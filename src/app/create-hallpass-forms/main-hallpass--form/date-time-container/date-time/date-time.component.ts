import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeService } from '../../../../services/time.service';
import { Navigation } from '../../main-hall-pass-form.component';
import { CreateFormService } from '../../../create-form.service';
import { ColorProfile } from '../../../../models/ColorProfile';
import * as moment from 'moment';

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

  startTime: moment.Moment = moment(this.timeService.nowDate());
  requestTime: moment.Moment = moment(this.timeService.nowDate()).add(5, 'minutes');

  form: FormGroup = new FormGroup({
    declinable: new FormControl(true)
  });
  declinable: FormControl = new FormControl(true);

  colorProfile: ColorProfile;

  constructor(private timeService: TimeService, private formService: CreateFormService) {
  }

  get gradient() {
    const color = this.colorProfile ? this.colorProfile.gradient_color : '#03CF31,#00B476';
    return `radial-gradient(circle at 98% 97%, ${color})`;
  }

  get selectedColor() {
    return this.colorProfile ? this.colorProfile.solid_color : '#00B476';
  }

  ngOnInit() {
    if (this.mock) {
      this.requestTime = moment(this.timeService.nowDate());
      // this.declinable = new FormControl(true);
    } else {
      if (this.formState.data.date) {
        if (this.formState.data.request) {
          this.colorProfile = this.formState.data.request.color_profile;
        }
        this.requestTime = moment(this.formState.data.date.date);
        this.declinable.setValue(this.formState.data.date.declinable);
      }
    }

  }

  calendarResult(date: moment.Moment[]) {
    this.requestTime = moment(date[0]);
  }

  next() {
    this.formState.data.date = {
      date: this.requestTime.toDate(),
      declinable: this.form.get('declinable').value
    };
    setTimeout(() => {
      this.result.emit(this.formState);
    }, 100);
  }

  back() {

    this.formService.setFrameMotionDirection('back');


    setTimeout(() => {
      if (this.isStaff) {
        this.formState.state = 1;
        this.formState.step = 2;
      } else {
        this.formState.step = 0;
      }
      console.log('AaA ===>>>', event);
      this.backButton.emit(this.formState);
    }, 100);




  }

}
