import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import { User } from '../../../models/User';
import { DataService } from '../../../services/data-service';
import { Pinnable } from '../../../models/Pinnable';
import { Util } from '../../../../Util';
import { FormFactor, Navigation } from '../main-hall-pass-form.component';
import { CreateFormService } from '../../create-form.service';
import { NextStep } from '../../../animations';
import { LocationsService } from '../../../services/locations.service';
import { map } from 'rxjs/operators';

import *as _ from 'lodash';

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

  user$: Observable<User>;
  user: User;
  isStaff: boolean;
  pinnables: Promise<Pinnable[]>;
  pinnable: Pinnable;
  data: any = {};
  frameMotion$: BehaviorSubject<any>;

  constructor(
      private dataService: DataService,
      private formService: CreateFormService,
      private locationsService: LocationsService,
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

  ngOnInit() {

    // this.formService.setFrameMotionDirection('disable');

    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.FORM_STATE.quickNavigator = false;

    // this.FORM_STATE.previousState = 0;
    this.data.fromLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.from ? this.FORM_STATE.data.direction.from : null;
    this.data.toLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.to ? this.FORM_STATE.data.direction.to : null;
    this.pinnables = this.formService.getPinnable();
    this.user$ = this.dataService.currentUser;
    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
    this.user$.subscribe((user: User) => {
        this.isStaff = user.isTeacher() || user.isAdmin();
        this.user = user;
    });
    combineLatest(this.pinnables, this.locationsService.getLocationsWithTeacher(this.user))
        .pipe(map(([pinnables, locations]) => {
            return pinnables.filter(pin => {
             return locations.find(loc => {
                 return (loc.category ? loc.category : loc.title) === pin.title;
             });
            });
        }), map((pinnables: Pinnable[]) => {
            // debugger;   // In process
            return pinnables;
        })).subscribe(res => console.log('RR ==>>', res));
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
              this.FORM_STATE.data.gradient = this.FORM_STATE.data.request.gradient_color;
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
    this.FORM_STATE.data.gradient = pinnable.gradient_color;
    this.FORM_STATE.data.icon = pinnable.icon;
    if (pinnable.category) {
      this.FORM_STATE.previousState = States.toWhere;
      return this.FORM_STATE.state = States.category;
    } else {
        this.data.toLocation = pinnable.location;
        this.FORM_STATE.data.direction.to = pinnable.location;
        const restricted = ((this.pinnable.location.restricted && !this.showDate) || (this.pinnable.location.scheduling_restricted && !!this.showDate));
        if (!this.isStaff && restricted && pinnable.location) {
            this.FORM_STATE.previousState = this.FORM_STATE.state;
            return this.FORM_STATE.state = States.restrictedTarget;
        } else {
           return this.postComposetData();
        }
    }

  }

  fromCategory(location) {

    this.data.toLocation = location;
    this.FORM_STATE.data.direction.to = location;
    // const restricted = ((location.restricted && !this.FORM_STATE.forLater) || (location.scheduling_restricted && !!this.FORM_STATE.forLater));
    if ((location.restricted || (location.scheduling_restricted && this.FORM_STATE.forLater)) && !this.isStaff) {
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
}
