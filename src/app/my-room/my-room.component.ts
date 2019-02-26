import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { combineLatest, merge, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { Util } from '../../Util';
import { DataService } from '../services/data-service';
import { mergeObject } from '../live-data/helpers';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../services/loading.service';
import { PassLike } from '../models';
import { Location } from '../models/Location';
import { testPasses } from '../models/mock_data';
import { BasicPassLikeProvider, PassLikeProvider, WrappedProvider } from '../models/providers';
import { User } from '../models/User';
import {DropdownComponent} from '../dropdown/dropdown.component';
import { TimeService } from '../services/time.service';

/**
 * RoomPassProvider abstracts much of the common code for the PassLikeProviders used by the MyRoomComponent.
 */
abstract class RoomPassProvider implements PassLikeProvider {

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(protected liveDataService: LiveDataService, protected location$: Observable<Location>,
              protected date$: Observable<Date>, protected search$: Observable<string>) {
  }

  protected abstract fetchPasses(sortingEvents: Observable<HallPassFilter>, location: Location, date: Date): Observable<PassLike[]>;

  watch(sort: Observable<string>) {
    // merge the sort events and search events into one Observable that emits the current state of both.
    const sort$ = sort.map(s => ({sort: s}));
    const search$ = this.search$.map(s => ({search_query: s}));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    // Create a subject that will replay the last state. This is necessary because of the use of switchMap.
    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    return combineLatest(this.location$, this.date$, (location, date) => ({location, date}))
      .switchMap(({location, date}) => this.fetchPasses(mergedReplay, location, date));
  }
}

class ActivePassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, location: Location, date: Date) {
    return this.liveDataService.watchActiveHallPasses(sortingEvents, {type: 'location', value: location}, date);
  }
}

class OriginPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, location: Location, date: Date) {
    return this.liveDataService.watchHallPassesFromLocation(sortingEvents, location, date);
  }
}

class DestinationPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, location: Location, date: Date) {
    return this.liveDataService.watchHallPassesToLocation(sortingEvents, location, date);
  }
}


@Component({
  selector: 'app-my-room',
  templateUrl: './my-room.component.html',
  styleUrls: ['./my-room.component.scss']
})
export class MyRoomComponent implements OnInit {

  testPasses: PassLikeProvider;

  activePasses: WrappedProvider;
  originPasses: WrappedProvider;
  destinationPasses: WrappedProvider;

  inputValue = '';
  calendarToggled = false;
  user: User;
  isStaff = false;
  min: Date = new Date('December 17, 1995 03:24:00');
  roomOptions: Location[];
  selectedLocation: Location;
  optionsOpen = false;
  canView = false;
  userLoaded = false;

  mergedOriginPassesPasses = [];
  mergedDestinationPasses = [];

  searchQuery$ = new BehaviorSubject('');
  searchDate$ = new BehaviorSubject<Date>(null);
  selectedLocation$ = new ReplaySubject<Location>(1);

  hasPasses: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService,
              public dialog: MatDialog, private liveDataService: LiveDataService, private timeService: TimeService) {
    this.setSearchDate(this.timeService.nowDate());

    this.testPasses = new BasicPassLikeProvider(testPasses);

    // Construct the providers we need.
    this.activePasses = new WrappedProvider(new ActivePassProvider(liveDataService, this.selectedLocation$,
      this.searchDate$, this.searchQuery$));
    this.originPasses = new WrappedProvider(new OriginPassProvider(liveDataService, this.selectedLocation$,
      this.searchDate$, this.searchQuery$));
    this.destinationPasses = new WrappedProvider(new DestinationPassProvider(liveDataService, this.selectedLocation$,
      this.searchDate$, this.searchQuery$));

    // Use WrappedProvider's length$ to keep the hasPasses subject up to date.
  }

  setSearchDate(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    this.searchDate$.next(date);
  }

  get searchDate() {
    return this.searchDate$.value;
  }

  get dateDisplay() {
    return Util.formatDateTime(this.searchDate).split(',')[0];
  }

  get choices() {
    // if (this.selectedLocation !== null) {
    //   return this.roomOptions.filter((room) => room.id !== this.selectedLocation.id);
    // } else {
      return this.roomOptions;
    // }
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
          this.isStaff = user.isTeacher() || user.isAdmin();
        });

        this.dataService.getLocationsWithTeacher(this.user).subscribe(locations => {
          this._zone.run(() => {
            this.roomOptions = locations;
            this.selectedLocation = (this.roomOptions.length > 0) ? this.roomOptions[0] : null;
            this.selectedLocation$.next(this.selectedLocation);
              // this.roomOptions.forEach(room => {
              //   this.selectedLocation$.next(room);
              //   this.mergedDestinationPasses.push(this.destinationPasses);
              //   this.mergedOriginPassesPasses.push(this.originPasses);
              // });
            this.userLoaded = true;
          });
        });
      });

      this.hasPasses = combineLatest(
        this.activePasses.length$,
        this.originPasses.length$,
        this.destinationPasses.length$,
        (l1, l2, l3) => l1 + l2 + l3 > 0
      );
      this.passesLoaded = combineLatest(
        this.activePasses.loaded$,
        this.originPasses.loaded$,
        this.destinationPasses.loaded$,
        (l1, l2, l3) => l1 && l2 && l3
      );
  }

  onSearch(search: string) {
    this.inputValue = search;
    this.searchQuery$.next(search);
  }

  showOptions(target: HTMLElement) {
    if (!this.optionsOpen && this.roomOptions && this.roomOptions.length > 1) {
      // const target = new ElementRef(evt.currentTarget);
        const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'heading': 'CHANGE ROOM',
          'locations': this.choices,
          'selectedLocation': this.selectedLocation,
          'trigger': target}
      });

      optionDialog.afterOpen().subscribe(() => {
        this.optionsOpen = true;
      });

      optionDialog.afterClosed().subscribe(data => {
        this.optionsOpen = false;
        this.selectedLocation = data == null ? this.selectedLocation : data;
          console.log(this.selectedLocation);
          this.selectedLocation$.next(this.selectedLocation);
      });
    }
  }
}
