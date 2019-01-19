import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { DataService } from '../../data-service';
import { LocationService } from './location.service';
import { Pinnable } from '../../models/Pinnable';
import { Util } from '../../../Util';
import {FormState} from '../../admin/overlay-container/overlay-container.component';
import {Navigation} from '../hallpass-form.component';

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss']
})
export class LocationsGroupContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;

  @Output() response: EventEmitter<any> = new EventEmitter<any>();

  user$: Observable<User>;
  isStaff: boolean;
  currentState: string;
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
      this.currentState = state;
      // debugger;
    });
    this.pinnables = this.locationService.getPinnable();
    this.user$ = this.dataService.currentUser;
    this.user$.subscribe((user: User) => this.isStaff = user.isTeacher() || user.isAdmin());
  }

  selectedDate({date, declinable}) {
    this.data.date = date;
    this.data.declinable = declinable;
    this.locationService.changeLocation$.next('from');
  }

  fromWhere(location) {
    this.data.fromLocation = location;
    this.locationService.changeLocation$.next('toWhere');
  }

  toWhere(pinnable) {
    this.pinnable = pinnable;
    if (pinnable.category) {
        this.locationService.changeLocation$.next('category');
    } else {
        this.data.toLocation = pinnable.location;
        this.postComposetData();

      }

  }

  fromCategory(location) {
    this.data.toLocation = location;
      if (location.restricted && !this.isStaff) {
        this.locationService.changeLocation$.next('restrictedTarget');
    } else {
       this.postComposetData();
    }
  }




  requestTarget(teacher) {
    this.data.requestTarget = teacher;
    this.locationService.changeLocation$.next('message');
  }

  resultMessage(message) {
    this.data.message = message;
    this.postComposetData();
  }


  private postComposetData() {
    this.FORM_STATE.step = 4;
    this.FORM_STATE.data.direction = {
      from: this.data.fromLocation,
      to: this.data.toLocation,
      pinnable: this.pinnable
    };
    this.FORM_STATE.data.message = this.data.message;
    this.FORM_STATE.data.requestTarget = this.data.requestTarget;

    console.log('After locs choised ======>', this.FORM_STATE);
    this.response.emit(this.FORM_STATE);
  }
}
