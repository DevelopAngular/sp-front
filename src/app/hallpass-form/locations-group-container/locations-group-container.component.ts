import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { DataService } from '../../data-service';
import { LocationService } from './location.service';
import { Pinnable } from '../../models/Pinnable';
import { Util } from '../../../Util';
import {FormFactor, Navigation, Role} from '../hallpass-form.component';

export enum States { from = 1, toWhere = 2, category = 3, restrictedTarget = 4, message = 5 }

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss']
})
export class LocationsGroupContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;

  @Output() nextStepEvent: EventEmitter<any> = new EventEmitter<any>();

  user$: Observable<User>;
  isStaff: boolean;
  pinnables: Promise<Pinnable[]>;
  pinnable: Pinnable;

  data: any = {};

  constructor(private dataService: DataService, private locationService: LocationService) { }

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
     if (!this.FORM_STATE.data.selectedStudents) {
        return false;
     } else {
         if (this.FORM_STATE.data.selectedGroup) {
             return this.FORM_STATE.data.selectedGroup.title;
         }
       return this.FORM_STATE.data.selectedStudents[0].display_name +
           (this.FORM_STATE.data.selectedStudents.length > 1 ? ` (${this.FORM_STATE.data.selectedStudents.length - 1})` : '');
     }
    }

  ngOnInit() {
    this.data.toLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.to ? this.FORM_STATE.data.direction.to : null;
    this.pinnables = this.locationService.getPinnable();
    this.user$ = this.dataService.currentUser;
    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
    this.user$.subscribe((user: User) => this.isStaff = user.isTeacher() || user.isAdmin());
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
        this.FORM_STATE.state = this.FORM_STATE.previousState;
    } else {
      this.FORM_STATE.state = States.toWhere;
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
      if (location.restricted && !this.isStaff) {
          this.FORM_STATE.previousState = this.FORM_STATE.state;
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
    this.data.message = message;
    this.FORM_STATE.data.message = message;
    this.postComposetData(denyMessage);
  }


  private postComposetData(close: boolean = false) {

    if (
      (this.FORM_STATE.formMode.role === Role.Student)
        &&
      (this.FORM_STATE.data.date
          ? Role.Student && (this.FORM_STATE.data.direction.to.scheduling_restricted || this.FORM_STATE.data.direction.to.restricted)
          : Role.Student && this.FORM_STATE.data.direction.to.restricted)
    ) {
      this.FORM_STATE.formMode.formFactor = FormFactor.Request;
    }
    this.FORM_STATE.step =  close ? 0 : 4;
    this.nextStepEvent.emit(this.FORM_STATE);
  }

  back(event) {
    this.FORM_STATE = event;
    this.nextStepEvent.emit(this.FORM_STATE);
  }
}
