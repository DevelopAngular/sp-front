import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import { User } from '../../../models/User';
import { DataService } from '../../../services/data-service';
import { Pinnable } from '../../../models/Pinnable';
import { Util } from '../../../../Util';
import {FormFactor, Navigation, Role} from '../main-hall-pass-form.component';
import {CreateFormService} from '../../create-form.service';
import {NextStep, NextStepColored, ScaledCard} from '../../../animations';

export enum States { from = 1, toWhere = 2, category = 3, restrictedTarget = 4, message = 5 }

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss'],
  animations: [NextStep, NextStepColored]
})
export class LocationsGroupContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;

  @Output() nextStepEvent: EventEmitter<any> = new EventEmitter<any>();

  user$: Observable<User>;
  isStaff: boolean;
  pinnables: Promise<Pinnable[]>;
  pinnable: Pinnable;

  data: any = {};

  frameMotion$: BehaviorSubject<any>;

  motionDirection = '';

  constructor(private dataService: DataService, private formService: CreateFormService) { }

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

    this.formService.setFrameMotionDirection('disable');

    this.frameMotion$ = this.formService.getFrameMotionDirection();


    // this.FORM_STATE.previousState = 0;
    this.data.toLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.to ? this.FORM_STATE.data.direction.to : null;
    this.pinnables = this.formService.getPinnable();
    this.user$ = this.dataService.currentUser;
    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
    this.user$.subscribe((user: User) => this.isStaff = user.isTeacher() || user.isAdmin());
  }


  stateTransition(stateNumber: number) {

    // if (stateNumber === this.FORM_STATE.state) {
    if (this.motionDirection === 'forward') {

         return {
          to: -100,
          // halfTo: -50,
          from: 100,
          // halfFrom: -50
        };
    } else if (this.motionDirection === 'back') {
      return {
        to: 100,
        // halfTo: -50,
        from: -100,
        // halfFrom: -50
      };
    }
      // if (stateNumber < this.FORM_STATE.previousState) {
      //
      //   return {
      //     to: 100,
      //     // halfTo: -50,
      //     from: -100,
      //     // halfFrom: -50
      //   };
      //
      // } else if (stateNumber > this.FORM_STATE.previousState) {
      //
      //   return {
      //     to: -100,
      //     // halfTo: 50,
      //     from: 100,
      //     // halfFrom: 50
      //   };
      //
      // }
    // } else if (stateNumber === this.FORM_STATE.state) {
    //
    //   if (stateNumber < this.FORM_STATE.previousState) {
    //
    //     return {
    //       to: -100,
    //       // halfTo: -50,
    //       from: -100,
    //       // halfFrom: -50
    //     };
    //
    //   } else if (stateNumber > this.FORM_STATE.previousState) {
    //
    //     return {
    //       to: 100,
    //       // halfTo: 50,
    //       from: 100,
    //       // halfFrom: 50
    //     };
    //
    //   }
    // }
  }


  fromWhere(location) {
    // this.setFrameMotion('forward');
    //
    // this.motionDirection = 'forward';

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
      this.FORM_STATE.previousState = States.from;
      this.FORM_STATE.state = States.toWhere;
    }
  }

  toWhere(pinnable) {
    // this.setFrameMotion('forward');
    //
    // this.motionDirection = 'forward';

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
    // this.setFrameMotion('forward');
    //
    // this.motionDirection = 'forward';

    this.data.toLocation = location;
    this.FORM_STATE.data.direction.to = location;
      if (location.restricted && !this.isStaff) {
          this.FORM_STATE.previousState = this.FORM_STATE.state;
          this.FORM_STATE.state = States.restrictedTarget;
    } else {
       this.postComposetData();
    }
  }

  requestTarget(teacher) {
    // this.setFrameMotion('forward');
    //
    // this.motionDirection = 'forward';

    this.data.requestTarget = teacher;
    this.FORM_STATE.data.requestTarget = teacher;
    this.FORM_STATE.state = States.message;
  }

  resultMessage(message, denyMessage: boolean = false) {
    // this.motionDirection = 'forward';

    if (!message) {
      message = '';
    }
    this.data.message = message;
    this.FORM_STATE.data.message = message;
    this.postComposetData(denyMessage);
  }


  private postComposetData(close: boolean = false) {
    const restricted = ((this.FORM_STATE.data.direction.to.restricted && !this.showDate) || (this.FORM_STATE.data.direction.to.scheduling_restricted && !!this.showDate));
    if (!this.isStaff && restricted) {
        this.FORM_STATE.formMode.formFactor = FormFactor.Request;
    }
    if (!this.isStaff && !restricted) {
        this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
    }
    this.FORM_STATE.step =  close ? 0 : 4;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

  // setFrameMotion(direction: string) {
  //   if (direction === 'forward') {
  //     this.frameMotion = {
  //       to: -100,
  //       from: 100
  //     }
  //   } else {
  //     this.frameMotion = {
  //       to: 100,
  //       from: -100
  //     }
  //   }
  // }

  back(event) {
    // this.setFrameMotion('back');
    // [this.frameMotion.to, this.frameMotion.from] = [this.frameMotion.from, this.frameMotion.to];

    this.FORM_STATE = event;
    this.data.message = null;
    this.FORM_STATE.data.message = null;
    this.nextStepEvent.emit(this.FORM_STATE);
  }
}