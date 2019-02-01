import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../hallpass-form.component';

@Component({
  selector: 'app-date-time-container',
  templateUrl: './date-time-container.component.html',
  styleUrls: ['./date-time-container.component.scss']
})
export class DateTimeContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;
  @Output('nextStepEvent')
  nextStepEvent: EventEmitter<Navigation | {action: string, data: any}> = new EventEmitter<Navigation | {action: string, data: any}>();

  constructor() { }

  ngOnInit() {
  }

  nextStep(evt) {
    this.FORM_STATE.data.date = evt;

    if (evt === 'exit') {
      this.nextStepEvent.emit({ action: 'exit', data: null });
      return;
    }

    if (this.FORM_STATE.previousStep === 3) {
      this.FORM_STATE.step = this.FORM_STATE.previousStep;
      this.FORM_STATE.state = this.FORM_STATE.previousState;
      this.FORM_STATE.previousStep = 1;
      return this.nextStepEvent.emit(this.FORM_STATE);
    }


    if (this.FORM_STATE.previousStep > 2) {
        this.FORM_STATE.step = this.FORM_STATE.previousStep;
    } else {
        this.FORM_STATE.step = this.FORM_STATE.forInput ? (this.FORM_STATE.formMode.role === 1 ? 2 : 3) : 0;
    }

    this.FORM_STATE.previousStep = 1;
    this.FORM_STATE.state = 1 ;

    console.log('Date FORM_STATE =====>', this.FORM_STATE);


    this.nextStepEvent.emit(this.FORM_STATE);
  }

}
