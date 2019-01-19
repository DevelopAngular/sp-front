import {Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import { User } from '../../models/User';
import { DataService } from '../../data-service';
import { LocationService } from './location.service';
import {Pinnable} from '../../models/Pinnable';

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

  selectedLocation(location) {
    this.data.location = location;
    this.locationService.changeLocation$.next('toWhere');
  }

  selectedPinnable(pinnable) {
    if (pinnable.category) {
      this.locationService.changeLocation$.next('category');
    } else {
      this.response.emit(this.data);
    }
    this.data.pinnable = pinnable;

  }

  fromCategory(location) {
    this.data.locFromCategory = location;
    this.response.emit(this.data);
  }

}
