import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { DataService } from '../../data-service';
import { LocationService } from './location.service';
import { Pinnable } from '../../models/Pinnable';
import { Util } from '../../../Util';

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss']
})
export class LocationsGroupContainerComponent implements OnInit {

  @Output() response: EventEmitter<any> = new EventEmitter<any>();

  user$: Observable<User>;
  isStaff: boolean;
  currentState: string;
  pinnables: Promise<Pinnable[]>;

  data: any = {};

  constructor(private dataService: DataService, private locationService: LocationService) { }

  get showDate() {
      if (!this.data.date) {
          return false;
      } else {
          return Util.formatDateTime(new Date(this.data.date));
      }
  }

  ngOnInit() {
    this.locationService.changeLocation$.subscribe(state => {
      this.currentState = state;
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
    this.data.toLocation = pinnable;
      if (pinnable.category) {
        this.locationService.changeLocation$.next('category');
    } else {
        this.response.emit(this.data);
    }

  }

  fromCategory(location) {
    this.data.locFromCategory = location;
      if (location.restricted && !this.isStaff) {
        this.locationService.changeLocation$.next('restrictedTarget');
    } else {
       this.response.emit(this.data);
    }
  }

  requestTarget(teacher) {
    this.data.requestTarget = teacher;
    this.locationService.changeLocation$.next('message');
  }

  resultMessage(message) {
    this.data.message = message;
    this.response.emit(this.data);
  }

}
