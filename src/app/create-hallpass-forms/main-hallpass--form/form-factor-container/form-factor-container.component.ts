import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {TimeService} from '../../../services/time.service';

import {FormFactor, Navigation} from '../main-hall-pass-form.component';
import {HallPass} from '../../../models/HallPass';
import {Request} from '../../../models/Request';
import {Invitation} from '../../../models/Invitation';
import {DataService} from '../../../services/data-service';
import {Pinnable} from '../../../models/Pinnable';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {StorageService} from '../../../services/storage.service';
import {PassLimitInfo} from '../../../models/HallPassLimits';


@Component({
  selector: 'app-form-factor-container',
  templateUrl: './form-factor-container.component.html',
  styleUrls: ['./form-factor-container.component.scss']
})
export class FormFactorContainerComponent implements OnInit {


  @Input() FORM_STATE: Navigation;
  @Input() forStaff: boolean;
  @Input() passLimitInfo: PassLimitInfo;
  @Output() nextStepEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public states: any = FormFactor;
  public currentState: number;
  public template: Request | HallPass | Invitation | Pinnable;
  public isOpenBigCard: boolean;

  constructor(
    private dataService: DataService,
    private timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private storage: StorageService
  ) {
  }

  ngOnInit() {
    this.isOpenBigCard = JSON.parse(this.storage.getItem('pass_full_screen')) && !this.forStaff;
    const now = this.timeService.nowDate();

    this.dataService.currentUser
      .subscribe((_user) => {

        let user = null;

        if (this.FORM_STATE.formMode.role === 2) {
          user = _user;
        } else if (this.FORM_STATE.formMode.role === 1 && this.dialogData['kioskModeRoom']) {
          user = this.FORM_STATE.data.selectedStudents[0];
        }

        switch (this.FORM_STATE.formMode.formFactor) {
          case this.states.HallPass:
            this.template = new HallPass(
              'template',
              user,
              null,
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
              this.FORM_STATE.data.date ? this.FORM_STATE.data.date.declinable : false,
              this.forStaff ? this.FORM_STATE.data.message : null
            );
            break;
          case this.states.Request:
            console.log(this.FORM_STATE);
            if (this.FORM_STATE.previousStep === 1) {
              setTimeout(() => {
                this.FORM_STATE.data.request.request_time = this.FORM_STATE.data.date.date;
                this.template = this.FORM_STATE.data.request;
              }, 100);
            } else {
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
                this.FORM_STATE.data.requestTarget ? [this.FORM_STATE.data.requestTarget] : [],
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
            }
            break;
          case this.states.Invitation:
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
              null,
              this.FORM_STATE.data.message
            );
            break;
        }
      });
  }


  onNextStep(evt) {
    this.FORM_STATE = evt;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

  onBack() {
    this.FORM_STATE.step = 3;
    this.FORM_STATE.state = 1;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

  openBigPass(value) {
    this.storage.setItem('pass_full_screen', value);
    setTimeout(() => {
      this.isOpenBigCard = value;
    }, 10);
  }

}
