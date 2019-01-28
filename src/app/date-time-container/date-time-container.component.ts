import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../hallpass-form/hallpass-form.component';

@Component({
  selector: 'app-date-time-container',
  templateUrl: './date-time-container.component.html',
  styleUrls: ['./date-time-container.component.scss']
})
export class DateTimeContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;
  @Output('nextStepEvent')
  nextStepEvent: EventEmitter<Navigation | string> = new EventEmitter<Navigation | string>();

  constructor() { }

  ngOnInit() {
  }

  nextStep(evt) {

    if (evt === 'exit') {
      this.nextStepEvent.emit('exit');
      return;
    }
    this.FORM_STATE.step = this.FORM_STATE.forInput ? (this.FORM_STATE.formMode.role === 1 ? 2 : 3) : 0;
    this.FORM_STATE.previousStep = 1;
    this.FORM_STATE.state = 1 ;
    this.FORM_STATE.data.date = evt;

    console.log('Date FORM_STATE =====>', this.FORM_STATE);


    this.nextStepEvent.emit(this.FORM_STATE);
  }

}
