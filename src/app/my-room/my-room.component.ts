import {Component, ElementRef, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {combineLatest, merge, of, BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
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
import {CalendarComponent} from '../admin/calendar/calendar.component';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {LocationsService} from '../services/locations.service';
import * as _ from 'lodash';
import {RepresentedUser} from '../navbar/navbar.component';
import {UserService} from '../services/user.service';

/**
 * RoomPassProvider abstracts much of the common code for the PassLikeProviders used by the MyRoomComponent.
 */
abstract class RoomPassProvider implements PassLikeProvider {

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(protected liveDataService: LiveDataService, protected locations$: Observable<Location[]>,
              protected date$: Observable<Date>, protected search$: Observable<string>) {
  }

  protected abstract fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date): Observable<PassLike[]>;

  watch(sort: Observable<string>) {
    // merge the sort events and search events into one Observable that emits the current state of both.
    const sort$ = sort.pipe(map(s => ({sort: s})));
    const search$ = this.search$.pipe(map(s => ({search_query: s})));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    // Create a subject that will replay the last state. This is necessary because of the use of switchMap.
    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    return combineLatest(this.locations$, this.date$, (locations, date) => ({locations, date}))
      .pipe(
        switchMap(({locations, date}) => this.fetchPasses(mergedReplay, locations, date))
      );
  }
}

class ActivePassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchActiveHallPasses(sortingEvents, {type: 'location', value: locations}, date);
  }
}

class OriginPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchHallPassesFromLocation(sortingEvents, locations, date);
  }
}

class DestinationPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchHallPassesToLocation(sortingEvents, locations, date);
  }
}


@Component({
  selector: 'app-my-room',
  templateUrl: './my-room.component.html',
  styleUrls: ['./my-room.component.scss']
})
export class MyRoomComponent implements OnInit, OnDestroy {

  testPasses: PassLikeProvider;

  activePasses: WrappedProvider;
  originPasses: WrappedProvider;
  destinationPasses: WrappedProvider;

  inputValue = '';
  calendarToggled = false;
  user: User;
  effectiveUser: RepresentedUser;
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
  selectedLocation$ = new ReplaySubject<Location[]>(1);

  hasPasses: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  destroy$ = new Subject();

  constructor(
      private _zone: NgZone,
      private loadingService: LoadingService,
      private liveDataService: LiveDataService,
      private timeService: TimeService,
      private locationService: LocationsService,

      public darkTheme: DarkThemeSwitch,
      public dataService: DataService,
      public dialog: MatDialog,
      public userService: UserService,
  ) {
    this.setSearchDate(this.timeService.nowDate());

    this.testPasses = new BasicPassLikeProvider(testPasses);

    const selectedLocationArray$ = this.selectedLocation$.pipe(map(location => location));

    // Construct the providers we need.
    this.activePasses = new WrappedProvider(new ActivePassProvider(liveDataService, selectedLocationArray$,
      this.searchDate$, this.searchQuery$));
    this.originPasses = new WrappedProvider(new OriginPassProvider(liveDataService, selectedLocationArray$,
      this.searchDate$, this.searchQuery$));
    this.destinationPasses = new WrappedProvider(new DestinationPassProvider(liveDataService, selectedLocationArray$,
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

  get myRoomHeaderColor() {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});
  }
  get UI() {
    return this.isStaff && this.roomOptions.length && this.canView;
  }
  get error() {
    return !this.isStaff || (this.isStaff && !this.roomOptions.length) || !this.canView;
  }

  ngOnInit() {

    combineLatest(
      this.dataService.currentUser,
      this.userService.effectiveUser,
      (cu: User, eu: RepresentedUser) => {
        return {cu, eu};
      }
    )
    .pipe(this.loadingService.watchFirst)
    .subscribe((v) => {
      this._zone.run(() => {

        this.user = v.cu;
        this.effectiveUser = v.eu;
        this.isStaff = v.cu.roles.includes('_profile_teacher');

        if (this.effectiveUser) {
          this.canView = this.effectiveUser.roles.includes('access_teacher_room');
        } else {
          this.canView = this.user.roles.includes('access_teacher_room');
        }
      });
    })

    combineLatest(
        this.dataService.getLocationsWithTeacher(this.user),
        this.locationService.myRoomSelectedLocation$
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(([locations, selected]: [Location[], Location]) => {
      this._zone.run(() => {
        this.roomOptions = locations;
        if (!selected) {
          this.selectedLocation$.next(locations);
        } else {
          this.selectedLocation = selected;
          this.selectedLocation$.next([selected]);
        }
        this.userLoaded = true;
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

  ngOnDestroy() {
    this.locationService.myRoomSelectedLocation$.next(this.selectedLocation);
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIcon(icon) {
    return this.darkTheme.getIcon({
      iconName: icon,
      darkFill: 'White',
      lightFill: 'Navy',
      setting: null
    });
  }

  chooseDate(event) {
    // this.calendarToggled = this.!calendarToggled

    // this.activeCalendar = true;
    const target = new ElementRef(event.currentTarget);
    // const DR = this.dialog.open(CalendarComponent, {
    //   panelClass: 'calendar-dialog-container',
    //   backdropClass: 'invis-backdrop',
    //   data: {
    //     'trigger': target,
    //     // 'previousSelectedDate': this.chartsDate ? new Date(this.chartsDate) : null,
    //   }
    // });



    const DR = this.dialog.open(CalendarComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target,
        'previousSelectedDate': this.searchDate
      }
    });
    DR.afterClosed().subscribe((_date) => {
      this.setSearchDate(_date.date);
    });
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
          'trigger': target
        }
      });

      optionDialog.afterOpen().subscribe(() => {
        this.optionsOpen = true;
      });

      optionDialog.beforeClose().subscribe(() => {
        this.optionsOpen = false;
      });

      optionDialog.afterClosed().pipe(filter(res => !!res)).subscribe(data => {
        this.selectedLocation = data === 'all_rooms' ? null : data;
        this.selectedLocation$.next(data !== 'all_rooms' ? [data] : this.roomOptions);
      });
    }
  }
}
