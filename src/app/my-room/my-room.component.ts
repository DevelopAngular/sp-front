import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import 'rxjs/operator/switchMap';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Util } from '../../Util';
import { DataService } from '../data-service';
import { LiveDataService } from '../live-data.service';
import { LoadingService } from '../loading.service';
import { BasicPassLikeProvider, PassLikeProvider } from '../models';
import { Location } from '../models/Location';
import { testPasses } from '../models/mock_data';
import { User } from '../models/User';
import { TeacherDropdownComponent } from '../teacher-dropdown/teacher-dropdown.component';

class ActivePassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private location$: Observable<Location>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.location$.switchMap(location => this.liveDataService.watchActiveHallPasses(sortReplay, {
      type: 'location',
      value: location
    }));
  }
}

class OriginPassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private location$: Observable<Location>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.location$.switchMap(location => this.liveDataService.watchHallPassesFromLocation(sortReplay, location));
  }
}

class DestinationPassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private location$: Observable<Location>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.location$.switchMap(location => this.liveDataService.watchHallPassesToLocation(sortReplay, location));
  }
}


@Component({
  selector: 'app-my-room',
  templateUrl: './my-room.component.html',
  styleUrls: ['./my-room.component.scss']
})
export class MyRoomComponent implements OnInit {

  testPasses: PassLikeProvider;

  activePasses: PassLikeProvider;
  originPasses: PassLikeProvider;
  destinationPasses: PassLikeProvider;

  inputValue = '';
  calendarToggled = false;
  user: User;
  isStaff = false;
  min: Date = new Date('December 17, 1995 03:24:00');
  _searchDate: Date = new Date();
  roomOptions: Location[];
  selectedLocation: Location;
  optionsOpen = false;
  canView = false;

  selectedLocation$ = new ReplaySubject<Location>(1);

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService,
              public dialog: MatDialog, private liveDataService: LiveDataService) {

    this.testPasses = new BasicPassLikeProvider(testPasses);

    this.activePasses = new ActivePassProvider(liveDataService, this.selectedLocation$);
    this.originPasses = new OriginPassProvider(liveDataService, this.selectedLocation$);
    this.destinationPasses = new DestinationPassProvider(liveDataService, this.selectedLocation$);

  }

  set searchDate(date: Date) {
    this._searchDate = date;
    date.setHours(0);
    date.setMinutes(0);
    this.dataService.updateMRDate(date);
  }

  get dateDisplay() {
    return Util.formatDateTime(this._searchDate).split(',')[0];
  }

  get choices() {
    if (this.selectedLocation !== null) {
      return this.roomOptions.filter((room) => room.id !== this.selectedLocation.id);
    } else {
      return this.roomOptions;
    }
  }

  get showArrow() {
    if (this.roomOptions) {
      if (this.roomOptions.length > 1) {
        return true;
      }
    } else {
      return false;
    }
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });

        this.dataService.getLocationsWithTeacher(this.user).subscribe(locations => {
          this._zone.run(() => {
            this.roomOptions = locations;
            this.selectedLocation = (this.roomOptions.length > 0) ? this.roomOptions[0] : null;
            this.selectedLocation$.next(this.selectedLocation);
          });
        });
      });
  }

  onSearch(search: string) {
    this.dataService.updateMRSearch(search);
  }

  showOptions(evt: MouseEvent) {
    if (!this.optionsOpen && this.roomOptions && this.roomOptions.length > 1) {
      const target = new ElementRef(evt.currentTarget);
      const optionDialog = this.dialog.open(TeacherDropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'choices': this.choices, 'trigger': target}
      });

      optionDialog.afterOpen().subscribe(() => {
        this.optionsOpen = true;
      });

      optionDialog.afterClosed().subscribe(data => {
        this.optionsOpen = false;
        this.selectedLocation = data == null ? this.selectedLocation : data;
        this.selectedLocation$.next(this.selectedLocation);
      });
    }
  }
}
