import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormFactor, Navigation} from '../hallpass-form/hallpass-form.component';
import {Request} from '../models/Request';
import {HallPass} from '../models/HallPass';
import {Invitation} from '../models/Invitation';




@Component({
  selector: 'app-form-factor-container',
  templateUrl: './form-factor-container.component.html',
  styleUrls: ['./form-factor-container.component.scss']
})
export class FormFactorContainerComponent implements OnInit {


  @Input() FORM_STATE: Navigation;
  @Output() nextStepEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public states: any = FormFactor;
  public currentState: number;
  public template: Request | HallPass | Invitation;

  constructor(
    // private http: HttpService
  ) { }

  ngOnInit() {

    this.currentState = this.FORM_STATE.formMode.formFactor;

    if (this.FORM_STATE.formMode.formFactor === this.states.Request) {
      this.template = new Request(
        'template',
        null,
        this.FORM_STATE.data.direction.from,
        this.FORM_STATE.data.direction.to,
        this.FORM_STATE.data.message,
        '',
        'pending',
        null,
        '',
        this.FORM_STATE.data.direction.pinnable.icon,
        this.FORM_STATE.data.requestTarget,
        this.FORM_STATE.data.date ? this.FORM_STATE.data.date.date : new Date(),
        '',
        null,
        null,
        this.FORM_STATE.data.direction.pinnable.color_profile,
        null,
        null,
        60,
        null
      );

    }

    if (this.FORM_STATE.formMode.formFactor === this.states.HallPass) {
    }

    console.log('FF ===>', this.currentState);



  }


  onNextStep(evt) {
    // console.log('event ============>', evt);
    // this.FORM_STATE.step = evt.step;
    // this.FORM_STATE.state = evt.state;
    // this.FORM_STATE.data.date = evt.data.date;
    this.FORM_STATE = evt;
    console.log('FORM FACTOR event ============>', evt);

  }

  onBack() {
    this.FORM_STATE.step = 3;
    this.FORM_STATE.state = 1;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

}
