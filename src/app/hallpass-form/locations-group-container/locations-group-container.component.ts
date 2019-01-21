import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { DataService } from '../../data-service';
import { LocationService } from './location.service';
import { Pinnable } from '../../models/Pinnable';
import { Util } from '../../../Util';
import {FormState} from '../../admin/overlay-container/overlay-container.component';
import {FormFactor, Navigation, Role} from '../hallpass-form.component';

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
  currentState: string;
  pastState: string;
  pinnables: Promise<Pinnable[]>;
  pinnable: Pinnable;

  data: any = {};

  constructor(private dataService: DataService, private locationService: LocationService) { }

  get showDate() {
      if (!this.FORM_STATE.data.date) {
          return false;
      } else {
          return Util.formatDateTime(new Date(this.FORM_STATE.data.date.date));
      }
  }

  ngOnInit() {
    console.log('Step #3 ======>', this.FORM_STATE);
    this.locationService.changeLocation$.subscribe(state => {
      if (state === 'exit') {

        this.FORM_STATE.step = 1;
        this.FORM_STATE.state = 1;

        this.nextStepEvent.emit(this.FORM_STATE);

      }
      this.currentState = state;
    });
    this.pinnables = this.locationService.getPinnable();
    this.user$ = this.dataService.currentUser;
    this.user$.subscribe((user: User) => this.isStaff = user.isTeacher() || user.isAdmin());
  }

  fromWhere(location) {
    this.data.fromLocation = location;
    this.locationService.nextStep('toWhere');
  }

  toWhere(pinnable) {
    this.pinnable = pinnable;
    if (pinnable.category) {
       return this.locationService.nextStep('category');
    } else {
        this.data.toLocation = pinnable.location;
        const restricted = ((this.pinnable.location.restricted && !this.showDate) || (this.pinnable.location.scheduling_restricted && !!this.showDate));
        if (!this.isStaff && restricted && pinnable.location) {
           return this.locationService.nextStep('restrictedTarget');
        } else {
           return this.postComposetData();
        }
    }

  }

  fromCategory(location) {
    this.data.toLocation = location;
      if (location.restricted && !this.isStaff) {
          this.locationService.nextStep('restrictedTarget');
    } else {
       this.postComposetData();
    }
  }




  requestTarget(teacher) {
    this.data.requestTarget = teacher;
    this.locationService.nextStep('message');
  }

  resultMessage(message) {
    this.data.message = message;
    this.postComposetData();
  }


  private postComposetData() {

    // this.FORM_STATE.formMode.formFactor = this.data.toLocation.restricted ? FormFactor.Request : FormFactor.HallPass

    if (this.FORM_STATE.formMode.role === Role.Student && this.data.toLocation.restricted) {
      this.FORM_STATE.formMode.formFactor = FormFactor.Request;
    }


    this.FORM_STATE.step = 4;
    this.FORM_STATE.data.direction = {
      from: this.data.fromLocation,
      to: this.data.toLocation,
      pinnable: this.pinnable,
      restricted: this.data.toLocation.restricted
    };
    this.FORM_STATE.data.message = this.data.message;
    this.FORM_STATE.data.requestTarget = this.data.requestTarget;

    console.log('After locs choised ======>', this.FORM_STATE);
    this.nextStepEvent.emit(this.FORM_STATE);
  }
}
