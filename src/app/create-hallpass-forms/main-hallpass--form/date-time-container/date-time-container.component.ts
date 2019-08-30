import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Navigation} from '../main-hall-pass-form.component';

import {CreateFormService} from '../../create-form.service';
import {FromWhereComponent} from '../locations-group-container/from-where/from-where.component';
import {DateTimeComponent} from './date-time/date-time.component';
import {DeviceDetection} from '../../../device-detection.helper';

@Component({
  selector: 'app-date-time-container',
  templateUrl: './date-time-container.component.html',
  styleUrls: ['./date-time-container.component.scss'],
})
export class DateTimeContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;
  @Output('nextStepEvent')
  nextStepEvent: EventEmitter<Navigation | {action: string, data: any}> = new EventEmitter<Navigation | {action: string, data: any}>();
  @ViewChild(DateTimeComponent) dateTimeComponent;

  constructor(
    private formService: CreateFormService
  ) { }

  ngOnInit() {
  }

  nextStep(evt) {


    this.formService.setFrameMotionDirection('forward');


    setTimeout(() => {

      this.FORM_STATE = evt;
      if (this.FORM_STATE.quickNavigator) {
        this.FORM_STATE.step = this.FORM_STATE.previousStep;
        this.FORM_STATE.state = this.FORM_STATE.previousState;
        this.FORM_STATE.previousStep = 1;
        return this.nextStepEvent.emit(this.FORM_STATE);
      }

      if (this.FORM_STATE.previousStep > 2) {
        this.FORM_STATE.step = this.FORM_STATE.previousStep;
      } else {
        this.FORM_STATE.step = this.FORM_STATE.forInput ||
        this.FORM_STATE.missedRequest ? 3 : this.FORM_STATE.resendRequest ? 0 : 4;
      }

      this.FORM_STATE.previousStep = 1;
      if (this.FORM_STATE.formMode.role === 1) {
        if (this.FORM_STATE.data.date.declinable) {
          this.FORM_STATE.state = 2;
        } else {
          this.FORM_STATE.state = 1;
        }
      } else {
        this.FORM_STATE.state = 1;
      }

      console.log('Date FORM_STATE =====>', this.FORM_STATE);

      this.nextStepEvent.emit(this.FORM_STATE);
    }, 100);

  }

  back(event) {
      this.dateTimeComponent.back();
      // this.FORM_STATE = event;
      // this.nextStepEvent.emit(event);
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
