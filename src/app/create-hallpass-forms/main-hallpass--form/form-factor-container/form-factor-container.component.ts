import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { TimeService } from '../../../services/time.service';

import { FormFactor, Navigation } from '../main-hall-pass-form.component';
import { HallPass } from '../../../models/HallPass';
import { Request } from '../../../models/Request';
import { Invitation } from '../../../models/Invitation';
import { DataService } from '../../../services/data-service';




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
    private dataService: DataService,
    private timeService: TimeService,
  ) { }


  ngOnInit() {
      const now = this.timeService.nowDate();

      this.dataService.currentUser
      .subscribe((_user) => {
        switch (this.FORM_STATE.formMode.formFactor) {
          case (this.states.HallPass): {
            this.template = new HallPass(
              'template',
              _user,
              null,
              null,
              null,
              this.FORM_STATE.data.date ? this.FORM_STATE.data.date.date : now,
              null,
              null,
              this.FORM_STATE.data.direction.from,
              this.FORM_STATE.data.direction.to,
              '',
              '',
              this.FORM_STATE.data.direction.pinnable.icon,
              this.FORM_STATE.data.direction.pinnable.color_profile,
              null,
              '',
              '',
              this.FORM_STATE.data.date ? this.FORM_STATE.data.date.declinable : false
            );

            break;
          }
          case (this.states.Request): {
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
              this.FORM_STATE.data.date ? this.FORM_STATE.data.date.date : null,
              '',
              null,
              null,
              this.FORM_STATE.data.direction.pinnable.color_profile,
              null,
              null,
              60,
              null
            );
            break;
          }
          case (this.states.Invitation): {

            this.template = new Invitation(
              'template',
              null,
              null,
              this.FORM_STATE.data.direction.to,
              [this.FORM_STATE.data.date ? this.FORM_STATE.data.date.date : now],
              _user,
              'pending',
              5,
              this.FORM_STATE.data.direction.pinnable.color_profile.gradient_color,
              this.FORM_STATE.data.direction.pinnable.icon,
              'round_trip',
              this.FORM_STATE.data.direction.pinnable.color_profile,
              null,
              null,
              null,
              null
            );

            break;
          }
        }
    });
  }



  onNextStep(evt) {
    this.FORM_STATE = evt;
    this.nextStepEvent.emit(this.FORM_STATE);
    console.log('FORM FACTOR event ============>', evt);
  }

  onBack() {
    this.FORM_STATE.step = 3;
    this.FORM_STATE.state = 1;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

}
