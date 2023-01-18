import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import {TimeService} from '../../../services/time.service';

import {FormFactor, Navigation} from '../main-hall-pass-form.component';
import {HallPass} from '../../../models/HallPass';
import {Request} from '../../../models/Request';
import {Invitation} from '../../../models/Invitation';
import {DataService} from '../../../services/data-service';
import {Pinnable} from '../../../models/Pinnable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PassLimitInfo} from '../../../models/HallPassLimits';
import { Location } from '../../../models/Location';
import { PassLike } from '../../../models';
import { DeviceDetection } from '../../../device-detection.helper';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WaitInLine } from '../../../models/WaitInLine'

export type PassLayout = 'pass' | 'request' | 'inlinePass' | 'inlineRequest';

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

  // using ViewChild as a setter ensures the element is available for assigning values
  @ViewChild('wrapper') set wrapper(divRef: ElementRef<HTMLDivElement>) {
    if (!divRef?.nativeElement) {
      return;
    }

    if (this.forStaff) {
      return;
    }

    const { nativeElement } = divRef;

    this.fullScreenPass$.asObservable().pipe(
      takeUntil(this.dialogRef.afterClosed())
    ).subscribe(scalePassUp => {
      scalePassUp
        ? this.scaleCardUp(nativeElement)
        : this.scaleCardDown(nativeElement);
    });
  }

  isMobile = DeviceDetection.isMobile();
  public states = FormFactor;
  public template: Request | HallPass | Invitation | Pinnable | WaitInLine;
  fullScreenPass$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private dataService: DataService,
    private timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public dialogData: {
      kioskModeRoom: Location,
      pass: PassLike,
      isActive: boolean,
      forInput: boolean,
      passLayout: PassLayout
    },
    @Optional() public dialogRef: MatDialogRef<FormFactorContainerComponent>
  ) {}

  ngOnInit() {
    const now = this.timeService.nowDate();

    this.dataService.currentUser
      .subscribe((_user) => {

        let user = null;

        if (this.FORM_STATE.formMode.role === 2) {
          user = _user;
        } else if (this.FORM_STATE.formMode.role === 1 && this.dialogData.kioskModeRoom) {
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
              undefined,
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

          case this.states.WaitInLine:
            const student = user ?? this.FORM_STATE.data.selectedStudents[0];
            this.template = new WaitInLine(
              'template',
              student,
              _user,
              null,
              null,
              5, // placeholder duration
              this.FORM_STATE.data.direction.from,
              this.FORM_STATE.data.direction.to,
              '',
              '',
              this.FORM_STATE.data.direction.pinnable.icon,
              this.FORM_STATE.data.direction.pinnable.color_profile,
              true,
              '3rd',
              this.FORM_STATE.data.date ? this.FORM_STATE.data.date.declinable : false,
              this.forStaff ? this.FORM_STATE.data.message : null,
              !this.forStaff
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

  private scaleCardUp(wrapper: HTMLDivElement) {
    let translationDistance = this.passLimitInfo !== undefined
      ? this.isMobile ? -65 : -60
      : -65;

    if (this.isMobile) {
      wrapper.style.transform = `scale(1.15) translateY(${translationDistance}px)`;
      return;
    }
    /**
     * - we want the full-screen pass to exist in the top 75% of the page
     * - we want to take off 10% of the remaining pixels to account for some space from the top of the page
     */
    const {height} = wrapper.getBoundingClientRect();
    const targetHeight = (document.documentElement.clientHeight * 0.70 * 0.90);
    const scalingFactor = targetHeight / height;
    translationDistance = (this.forStaff || this.dialogData.kioskModeRoom) ? 0 : -100;
    // translate happens before the scaling
    wrapper.style.transform = `translateY(${translationDistance}px) scale(${scalingFactor})`;
  }

  private scaleCardDown(wrapper: HTMLDivElement) {
    wrapper.style.removeProperty('transform');
  }

}
