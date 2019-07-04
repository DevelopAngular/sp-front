import {AfterViewInit, Component, EventEmitter, forwardRef, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import { User } from '../../../models/User';
import { DataService } from '../../../services/data-service';
import { Pinnable } from '../../../models/Pinnable';
import { Util } from '../../../../Util';
import { FormFactor, Navigation } from '../main-hall-pass-form.component';
import { CreateFormService } from '../../create-form.service';
import { NextStep } from '../../../animations';
import { LocationsService } from '../../../services/locations.service';
import {filter, map} from 'rxjs/operators';

import *as _ from 'lodash';
import {MAT_DIALOG_DATA} from '@angular/material';
import {FromWhereComponent} from './from-where/from-where.component';
import {ToCategoryComponent} from './to-category/to-category.component';
import {RestrictedTargetComponent} from './restricted-target/restricted-target.component';
import {RestrictedMessageComponent} from './restricted-message/restricted-message.component';
import {ToWhereComponent} from './to-where/to-where.component';
import {ScreenService} from '../../../services/screen.service';

export enum States { from = 1, toWhere = 2, category = 3, restrictedTarget = 4, message = 5 }

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss'],
  animations: [NextStep]
})
export class LocationsGroupContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;

  @Output() nextStepEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(FromWhereComponent) fromWhereComp;
  @ViewChild(forwardRef( () => ToWhereComponent) ) toWhereComp;
  @ViewChild(ToCategoryComponent) toCategoryComp;
  @ViewChild(RestrictedTargetComponent) restTargetComp;
  @ViewChild(RestrictedMessageComponent) restMessageComp;

  user$: Observable<User>;
  user: User;
  isStaff: boolean;
  pinnables: Promise<Pinnable[]>;
  pinnable: Pinnable;
  data: any = {};
  frameMotion$: BehaviorSubject<any>;

  teacherRooms$: Observable<Pinnable[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dataService: DataService,
    private formService: CreateFormService,
    private locationsService: LocationsService,
    private screenService: ScreenService,

  ) { }

  get showDate() {
      if ( this.FORM_STATE.data.date ) {

        if (!this.FORM_STATE.data.date.date ) {
          return false;
        } else {
          return Util.formatDateTime(new Date(this.FORM_STATE.data.date.date));
        }

      }
  }

  get studentText() {
   if (this.isStaff) {
       if (!this.FORM_STATE.data.selectedStudents) {
           return false;
       } else if (this.FORM_STATE.data.selectedGroup) {
           return this.FORM_STATE.data.selectedGroup.title;
       } else {
           return this.FORM_STATE.data.selectedStudents[0].display_name +
               (this.FORM_STATE.data.selectedStudents.length > 1 ? ` (${this.FORM_STATE.data.selectedStudents.length - 1})` : '');
       }
   }
  }

  get redirectTo() {
      const to = this.FORM_STATE.data.direction.to;
      if (
          to.request_mode === 'specific_teachers' ||
          to.request_mode === 'all_teachers_in_room' ||
          (this.FORM_STATE.forLater && to.scheduling_request_mode === 'specific_teachers') ||
          (this.FORM_STATE.forLater && to.scheduling_request_mode === 'all_teachers_in_room')
      ) {
          return States.message;
      } else {
          return States.restrictedTarget;
      }
  }

  ngOnInit() {

    // this.formService.setFrameMotionDirection('disable');

    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.FORM_STATE.quickNavigator = false;

    // this.FORM_STATE.previousState = 0;
    this.data.fromLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.from ? this.FORM_STATE.data.direction.from : null;
    this.data.toLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.to ? this.FORM_STATE.data.direction.to : null;
    this.pinnables = this.formService.getPinnable(!!this.dialogData['kioskModeRoom']);
    this.user$ = this.dataService.currentUser;
    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
    this.user$.subscribe((user: User) => {
        this.isStaff = user.isTeacher() || user.isAdmin();
        this.user = user;
    });
  }

  fromWhere(location) {

    if (this.FORM_STATE.data.hasClose) {
       return  this.nextStepEvent.emit(
            {
                action: 'exit',
                data: {
                    'fromLocation': location
                }
            });
    }
    this.data.fromLocation = location;
    this.FORM_STATE.data.direction = {
      from: location,
      to: this.data.toLocation,
      pinnable: this.pinnable
    };
    if (this.FORM_STATE.state < this.FORM_STATE.previousState) {
        [this.FORM_STATE.state, this.FORM_STATE.previousState] = [this.FORM_STATE.previousState, this.FORM_STATE.state];
    } else {
        if (this.FORM_STATE.fromState > 1) {
            this.FORM_STATE.state = this.FORM_STATE.fromState;
        } else {
            if (this.FORM_STATE.missedRequest) {
              this.FORM_STATE.state = States.message;
              this.FORM_STATE.data.gradient = this.FORM_STATE.data.request.color_profile.gradient_color;
              this.FORM_STATE.data.requestTarget = this.FORM_STATE.data.request.issuer;
              this.FORM_STATE.data.direction.pinnable = this.FORM_STATE.data.request;
            } else {
              this.FORM_STATE.state = States.toWhere;
            }
        }
        this.FORM_STATE.previousState = States.from;

    }
  }

  toWhere(pinnable) {
    this.pinnable = pinnable;
    this.FORM_STATE.data.direction = {
        from: this.data.fromLocation,
        pinnable: pinnable
    };
    this.FORM_STATE.data.gradient = pinnable.color_profile.gradient_color;
    this.FORM_STATE.data.icon = pinnable.icon;
    if (pinnable.type === 'category') {
      this.FORM_STATE.previousState = States.toWhere;
      return this.FORM_STATE.state = States.category;
    } else {
        this.data.toLocation = pinnable.location;
        this.FORM_STATE.data.direction.to = pinnable.location;
        const restricted = ((this.pinnable.location.restricted && !this.showDate) || (this.pinnable.location.scheduling_restricted && !!this.showDate));
        if (!this.isStaff && restricted && pinnable.location) {
            this.FORM_STATE.previousState = this.FORM_STATE.state;
            return this.FORM_STATE.state = States.restrictedTarget;
            // return this.FORM_STATE.state = this.redirectTo;
        } else {
           return this.postComposetData();
        }
    }

  }

  fromCategory(location) {

    this.data.toLocation = location;
    this.FORM_STATE.data.direction.to = location;
    // const restricted = ((location.restricted && !this.FORM_STATE.forLater) || (location.scheduling_restricted && !!this.FORM_STATE.forLater));
    if (((location.restricted && !this.FORM_STATE.forLater) || (location.scheduling_restricted && this.FORM_STATE.forLater)) && !this.isStaff) {
        this.FORM_STATE.previousState = States.from;
        this.FORM_STATE.state = States.restrictedTarget;
    } else {
        this.postComposetData();
    }
  }

  requestTarget(teacher) {
    this.data.requestTarget = teacher;
    this.FORM_STATE.data.requestTarget = teacher;
    this.FORM_STATE.state = States.message;
  }

  resultMessage(message, denyMessage: boolean = false) {
    if (!message) {
        message = '';
    }
    this.data.message = message;
    this.FORM_STATE.data.message = message;
    this.postComposetData(denyMessage, true);
  }


  private postComposetData(close: boolean = false, isMessage?: boolean) {
    const restricted = ((this.FORM_STATE.data.direction.to.restricted && !this.FORM_STATE.forLater) ||
        (this.FORM_STATE.data.direction.to.scheduling_restricted && !!this.FORM_STATE.forLater));
    if (!this.isStaff && !restricted) {
        this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
    }
      if (!this.isStaff && (restricted || isMessage)) {
          this.FORM_STATE.formMode.formFactor = FormFactor.Request;
      }
    if (this.isStaff) {
      if (this.FORM_STATE.data.date && this.FORM_STATE.data.date.declinable) {
         this.FORM_STATE.formMode.formFactor = FormFactor.Invitation;
      } else {
         this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
      }
    }
    this.FORM_STATE.previousStep = 3;
    // this.FORM_STATE.step =  close ? 0 : 4;
    setTimeout(() => {
      this.FORM_STATE.step =  close ? 0 : 4;
      this.nextStepEvent.emit(this.FORM_STATE);
    }, 100);
  }

  back(event) {

    this.FORM_STATE = event;
    this.data.message = null;
    this.FORM_STATE.data.message = null;

    // setTimeout(() => {

      this.nextStepEvent.emit(this.FORM_STATE);
    // }, 100);
  }

  stepBack() {
    switch (this.FORM_STATE.state) {
      case 1:
        this.fromWhereComp.back();
        this.nextStepEvent.emit(this.FORM_STATE);
        break;
      case 2:
        if (this.toWhereComp) {
          this.toWhereComp.back();
        }
        break;
      case 3:
        if (this.toCategoryComp) {
          this.toCategoryComp.back();
        }
        break;
      case 4:
        if (this.restTargetComp) {
          this.restTargetComp.back();
        }
        break;
      case 5:
        this.restMessageComp.back();
        break;
    }
  }
}
