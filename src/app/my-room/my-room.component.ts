import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialog} from '@angular/material';
import {combineLatest, merge, of, BehaviorSubject, Observable, ReplaySubject, Subject, interval} from 'rxjs';
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
import { DropdownComponent } from '../dropdown/dropdown.component';
import { TimeService } from '../services/time.service';
import { CalendarComponent } from '../admin/calendar/calendar.component';
import {delay, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { LocationsService } from '../services/locations.service';
import { RepresentedUser } from '../navbar/navbar.component';
import { UserService } from '../services/user.service';
import { ScreenService } from '../services/screen.service';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';
import { MyRoomAnimations } from './my-room.animations';
import { KioskModeService } from '../services/kiosk-mode.service';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { bumpIn } from '../animations';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { HttpService } from '../services/http-service';
import {ScrollPositionService} from '../scroll-position.service';
import {DeviceDetection} from '../device-detection.helper';
import {HallPassesService} from '../services/hall-passes.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';

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

export class ActivePassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchActiveHallPasses(sortingEvents, {type: 'location', value: locations}, date);
  }
}

class OriginPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchHallPassesFromLocation(sortingEvents, locations, date);
        // .pipe(map(passes => passes.filter(pass => moment().isSameOrAfter(moment(pass.end_time)))));
  }
}

class DestinationPassProvider extends RoomPassProvider {
  protected fetchPasses(sortingEvents: Observable<HallPassFilter>, locations: Location[], date: Date) {
    return this.liveDataService.watchHallPassesToLocation(sortingEvents, locations, date);
        // .pipe(map(passes => passes.filter(pass => moment().isSameOrAfter(moment(pass.end_time)))));
  }
}


@Component({
  selector: 'app-my-room',
  templateUrl: './my-room.component.html',
  styleUrls: ['./my-room.component.scss'],
  animations: [
    MyRoomAnimations.calendarTrigger,
    MyRoomAnimations.collectionsBlockTrigger,
    MyRoomAnimations.headerTrigger,
    MyRoomAnimations.calendarIconTrigger,
    bumpIn
  ],
})
export class MyRoomComponent implements OnInit, OnDestroy {

  private scrollableAreaName = 'MyRoom';
  private scrollableArea: HTMLElement;

  @ViewChild('scrollableArea') set scrollable(scrollable: ElementRef) {
    if (scrollable) {
      this.scrollableArea = scrollable.nativeElement;

      const updatePosition = function () {

        const scrollObserver = new Subject();
        const initialHeight = this.scrollableArea.scrollHeight;
        const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

        /**
         * If the scrollable area has static height, call `scrollTo` immediately,
         * otherwise additional subscription will perform once if the height changes
         */

        if (scrollOffset) {
          this.scrollableArea.scrollTo({top: scrollOffset});
        }

        interval(50)
          .pipe(
            filter(() => {
              return initialHeight < ((scrollable.nativeElement as HTMLElement).scrollHeight) && scrollOffset;
            }),
            takeUntil(scrollObserver)
          )
          .subscribe((v) => {
            console.log(scrollOffset);
            if (v) {
              this.scrollableArea.scrollTo({top: scrollOffset});
              scrollObserver.next();
              scrollObserver.complete();
              updatePosition();
            }
          });
      }.bind(this);
      updatePosition();
    }
  }

  testPasses: PassLikeProvider;
  activePasses: WrappedProvider;
  originPasses: WrappedProvider;
  destinationPasses: WrappedProvider;

  inputValue = '';
  user: User;
  effectiveUser: RepresentedUser;
  isStaff = false;
  min: Date = new Date('December 17, 1995 03:24:00');
  roomOptions: Location[];
  selectedLocation: Location;
  optionsOpen = false;
  canView = false;
  userLoaded = false;

  buttonDown: boolean;
  hovered: boolean;

  searchQuery$ = new BehaviorSubject('');
  searchDate$ = new BehaviorSubject<Date>(null);
  selectedLocation$ = new ReplaySubject<Location[]>(1);

  searchPending$: Subject<boolean> = new Subject<boolean>();

  hasPasses: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  destroy$ = new Subject();

  optionsClick: boolean;

  isCalendarShowed: boolean;

  isCalendarClick: boolean;

  isSearchBarClicked: boolean;

  resetValue = new Subject();

  currentPasses$ = new Subject();

  currentPassesDates: Map<string, number> = new Map();
  holdScrollPosition: number = 0;

  constructor(
      private _zone: NgZone,
      private loadingService: LoadingService,
      private liveDataService: LiveDataService,
      private timeService: TimeService,
      private locationService: LocationsService,
      private passesService: HallPassesService,
      public darkTheme: DarkThemeSwitch,
      public dataService: DataService,
      public dialog: MatDialog,
      public userService: UserService,
      public kioskMode: KioskModeService,
      private sanitizer: DomSanitizer,
      private storage: StorageService,
      private http: HttpService,
      private screenService: ScreenService,
      public router: Router,
      private scrollPosition: ScrollPositionService

  ) {
    this.setSearchDate(this.timeService.nowDate());
    console.log(this.kioskMode);
    this.testPasses = new BasicPassLikeProvider(testPasses);

    const selectedLocationArray$ = this.selectedLocation$
      .pipe(
        map((location) => {
         return location && location.length ? location.map(l => Location.fromJSON(l)) : [];
        })
      );

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

  get buttonState() {
      return this.buttonDown ? 'down' : 'up';
  }

  get searchDate() {
    return this.searchDate$.value;
  }

  get showKioskModeButton() {
    return this.selectedLocation || this.roomOptions.length === 1;
  }

  get dateDisplay() {
    return Util.formatDateTime(this.searchDate).split(',')[0];
  }

  get choices() {
    return this.roomOptions;
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

  get shadow() {
    return this.sanitizer.bypassSecurityTrustStyle((this.hovered ?
      '0 2px 4px 1px rgba(0, 0, 0, 0.3)' : '0 1px 4px 0px rgba(0, 0, 0, 0.25)'));
  }

  ngOnInit() {
    combineLatest(
      this.dataService.currentUser,
      this.userService.effectiveUser,
    )
    .pipe(
      this.loadingService.watchFirst,
      tap(([cu, eu]) => {
        this._zone.run(() => {

          this.user = cu;
          this.effectiveUser = eu;
          this.isStaff = cu.isAssistant() ? eu.roles.includes('_profile_teacher') : cu.roles.includes('_profile_teacher');

          if (this.user.isAssistant() && this.effectiveUser) {
            this.canView = this.effectiveUser.roles.includes('access_teacher_room');
          } else {
            this.canView = this.user.roles.includes('access_teacher_room');
          }
        });
      }),
      switchMap(([cu, eu]) => {
        return combineLatest(
          this.locationService.getLocationsWithTeacherRequest(this.user.isAssistant() ? this.effectiveUser.user : this.user ),
          this.locationService.myRoomSelectedLocation$
        );
      }),
      takeUntil(this.destroy$)
    )
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

    this.passesService.getAggregatedPasses()
      .subscribe((res: any) => {
         res.forEach((pass, i) => {
           this.currentPassesDates.set(new Date(pass.pass_date).toDateString(), i);
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
    ).pipe(
      filter(v => v),
      delay(250),
      tap((res) => this.searchPending$.next(!res))
    );
  }

  ngOnDestroy() {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
    this.locationService.myRoomSelectedLocation$.next(this.selectedLocation);
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPress(press: boolean) {
      this.buttonDown = press;
  }

  onHover(hover: boolean) {
      this.hovered = hover;
      if (!hover) {
          this.buttonDown = false;
      }
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
    const target = new ElementRef(event.currentTarget);
    const DR = this.dialog.open(CalendarComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target,
        'previousSelectedDate': this.searchDate,
        'dotsDates': this.currentPassesDates
      }
    });
    DR.afterClosed().subscribe((_date) => {
      if (_date.date && _date.date !== '') {
        this.setSearchDate(_date.date);
      }
    });
  }

  setRoomToKioskMode() {
    let kioskRoom;
    if (this.roomOptions.length === 1) {
        kioskRoom = this.roomOptions[0];
    } else {
      kioskRoom = Object.assign({}, this.selectedLocation);
    }
    this.kioskMode.currentRoom$.next(kioskRoom);
    this.userService.saveKioskModeLocation(kioskRoom.id).subscribe((res: any) => {
        this.storage.setItem('kioskToken', res.access_token);
        this.http.kioskTokenSubject$.next(res);
        this.router.navigate(['main/kioskMode']);
    });

  }

  onSearch(search: string) {
    this.inputValue = search;
    this.searchPending$.next(true);
    this.searchQuery$.next(search);
  }


  displayOptionsPopover(target: HTMLElement) {
    if (!this.optionsOpen && this.roomOptions && this.roomOptions.length > 1) {
      UNANIMATED_CONTAINER.next(true);
      const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'heading': 'CHANGE ROOM',
          'locations': this.choices,
          'selectedLocation': this.selectedLocation,
          'trigger': target,
          'scrollPosition': this.holdScrollPosition
        }
      });

      optionDialog.afterOpen().subscribe(() => {
        this.optionsOpen = true;
      });

      optionDialog.beforeClose().subscribe(() => {
        this.optionsOpen = false;
      });

      optionDialog.afterClosed()
        .pipe(
          tap(() => UNANIMATED_CONTAINER.next(false)),
          filter(res => !!res)
        )
        .subscribe(data => {
          // console.log(data);
          this.holdScrollPosition = data.scrollPosition;
          this.selectedLocation = data.selectedRoom === 'all_rooms' ? null : data.selectedRoom;
          this.selectedLocation$.next(data.selectedRoom !== 'all_rooms' ? [data.selectedRoom] : this.roomOptions);
        });
    }
  }

  showMainForm(forLater: boolean): void {
    const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
      panelClass: 'main-form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        'forLater': forLater,
        'forStaff': this.isStaff,
        'forInput': true,
        'kioskMode': true,
        'kioskModeRoom': this.kioskMode.currentRoom$.value
      }
    });
  }

  showOptions(target: HTMLElement) {
    this.optionsClick = !this.optionsClick;
    if (this.screenService.isDeviceMid || this.screenService.isIpadWidth) {
      this.openOptionsMenu();
    } else {
      this.displayOptionsPopover(target);
    }
  }

  calendarClick() {
    this.isCalendarShowed = !this.isCalendarShowed;
    this.isCalendarClick = !this.isCalendarClick;
  }

  toggleSearchBar() {
    this.isSearchBarClicked = !this.isSearchBarClicked;
  }

  cleanSearchValue() {
    this.resetValue.next('');
  }

  onDate(event) {
    debugger;
    this.setSearchDate(event[0]._d);
  }

  openOptionsMenu() {
    setTimeout(() => {
      const dialogData = {
        title: 'change room',
        list: [{name: 'all rooms', isSelected: true, selectedItem: null}],
      };

      if (this.selectedLocation) {
        dialogData.list[0].isSelected = false;
      }

      this.choices.forEach((choice) => {
        let isItemSelected: boolean;

        if (this.selectedLocation && (this.selectedLocation.title === choice.title)) {
          isItemSelected = true;
        }

        dialogData.list.push({
          name: choice.title,
          isSelected: isItemSelected,
          selectedItem: choice,
        });
      });

      const dialogRef = this.dialog.open(SortMenuComponent, {
        position: {bottom: '0'},
        panelClass: 'options-dialog',
        data: dialogData
      });

      dialogRef.componentInstance.onListItemClick.subscribe((index) => {
        this.selectedLocation = dialogData.list.find((option, i) => {
          return i === index;
        }).selectedItem;
        this.selectedLocation$.next(this.selectedLocation !== null ? [this.selectedLocation] : this.roomOptions);
      });
    }, 100);
  }

  calendarSlideState(stateName: string): string {
    switch (stateName) {
      case  'leftRight':
        return this.isCalendarClick ? 'slideLeft' : 'slideRight';
      case 'topBottom':
        return this.isCalendarClick ? 'slideTop' : 'slideBottom';
    }
  }

  get collectionsSlideState() {
    if (!this.screenService.isIpadWidth && this.isCalendarClick && !this.isSearchBarClicked) {
      return 'collectionsTop';
    }

    if (!this.screenService.isIpadWidth && !this.isCalendarClick && !this.isSearchBarClicked) {
      return 'collectionsBottom';
    }
  }

  get headerState() {
    return this.isSearchBarClicked ? 'headerTop' : 'headerBottom';
  }

  get calendarIconState() {
    return this.isSearchBarClicked ? 'calendarIconLeft' : 'calendarIconRight';
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get collectionWidth() {
    let maxWidth = 533;

    if (this.screenService.createCustomBreakPoint(maxWidth)) {
        maxWidth = 336;
    }

    if (this.screenService.createCustomBreakPoint(850) && this.isCalendarClick && !this.isIOSTablet && !this.is670pxBreakPoint
      || this.screenService.createCustomBreakPoint(850) && this.isCalendarClick && !this.is670pxBreakPoint ) {
      maxWidth = 336;
    }
    return maxWidth + 'px';
  }

  get is670pxBreakPoint() {
    const customBreakPoint = 670;
    return this.screenService.createCustomBreakPoint(customBreakPoint);
  }
}
