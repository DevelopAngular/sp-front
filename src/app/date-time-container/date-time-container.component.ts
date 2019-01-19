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
  nextStepEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  constructor() { }

  ngOnInit() {
  }

  nextStep(evt) {
    console.log('Local Date event =====>', evt, this.FORM_STATE);
    this.FORM_STATE.step = this.FORM_STATE.formMode.role === 1 ? 2 : 3;
    // Object.defineProperty(this.FORM_STATE.data, 'date', evt)
    this.FORM_STATE.data.date = evt;

    console.log('FORM_STATE =====>', this.FORM_STATE);


    this.nextStepEvent.emit(this.FORM_STATE);
  }

}
