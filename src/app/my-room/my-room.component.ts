import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, combineLatest, interval, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {Util} from '../../Util';
import {mergeObject} from '../live-data/helpers';
import {LiveDataService} from '../live-data/live-data.service';
import {LoadingService} from '../services/loading.service';
import {Location} from '../models/Location';
import {testPasses} from '../models/mock_data';
import {BasicPassLikeProvider, PassLikeProvider} from '../models/providers';
import {User} from '../models/User';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {TimeService} from '../services/time.service';
import {CalendarComponent} from '../admin/calendar/calendar.component';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {LocationsService} from '../services/locations.service';
import {RepresentedUser} from '../navbar/navbar.component';
import {UserService} from '../services/user.service';
import {ScreenService} from '../services/screen.service';
import {SortMenuComponent} from '../sort-menu/sort-menu.component';
import {MyRoomAnimations} from './my-room.animations';
import {KioskModeService} from '../services/kiosk-mode.service';
import {bumpIn} from '../animations';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {StorageService} from '../services/storage.service';
import {HttpService} from '../services/http-service';
import {ScrollPositionService} from '../scroll-position.service';
import {DeviceDetection} from '../device-detection.helper';
import {HallPassesService} from '../services/hall-passes.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {GoogleLoginService} from '../services/google-login.service';

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

  @ViewChild('calendar') calendar: ElementRef;

  testPasses: PassLikeProvider;
  activePasses: any;
  originPasses: any;
  destinationPasses: any;

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
  isEnableProfilePictures$: Observable<boolean>;

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
      public dialog: MatDialog,
      public userService: UserService,
      public loginService: GoogleLoginService,
      public kioskMode: KioskModeService,
      private sanitizer: DomSanitizer,
      private storage: StorageService,
      private http: HttpService,
      public screenService: ScreenService,
      public router: Router,
      private scrollPosition: ScrollPositionService

  ) {
    this.setSearchDate(this.timeService.nowDate());
    this.testPasses = new BasicPassLikeProvider(testPasses);

    const selectedLocationArray$ = this.selectedLocation$
      .pipe(
        map((location) => {
         return location && location.length ? location.map(l => Location.fromJSON(l)) : [];
        })
      );
    combineLatest(
      selectedLocationArray$,
      this.searchDate$,
      this.searchQuery$.pipe(map(s => ({search_query: s})))
    )
    .subscribe(([locations, date, query]) => {
      this.liveDataService.getMyRoomActivePassesRequest(mergeObject({sort: '-created', search_query: ''}, of(query)), {type: 'location', value: locations}, date);
      this.liveDataService.getFromLocationPassesRequest(mergeObject({sort: '-created', search_query: ''}, of(query)), locations, date);
      this.liveDataService.getToLocationPassesRequest(mergeObject({sort: '-created', search_query: ''}, of(query)), locations, date);
    });

    this.activePasses = this.liveDataService.myRoomActivePasses$;
    this.originPasses = this.liveDataService.fromLocationPasses$;
    this.destinationPasses = this.liveDataService.toLocationPasses$;
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

  get showProfilePictures() {
    return this.http.getSchool().profile_pictures_enabled && this.user.show_profile_pictures;
  }

  ngOnInit() {
    this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;
    combineLatest(
      this.userService.user$.pipe(filter(u => !!u), map(u => User.fromJSON(u))),
      this.userService.effectiveUser,
    )
    .pipe(
      tap(([cu, eu]) => {
        this.user = cu;
        this.effectiveUser = eu;
        this.isStaff = cu.isAssistant() ? eu.roles.includes('_profile_teacher') : cu.roles.includes('_profile_teacher');
        this.canView = this.user.roles.includes('access_teacher_room');
      }),
      switchMap(([cu, eu]) => {
        return combineLatest(
          this.locationService.getLocationsWithTeacherRequest(this.user.isAssistant() ? this.effectiveUser.user : this.user)
            .pipe(filter((res: any[]) => !!res.length)),
          this.locationService.myRoomSelectedLocation$
        );
      }),
      takeUntil(this.destroy$),
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

    this.selectedLocation$
      .pipe(
        takeUntil(this.destroy$),
        filter((res: any[]) => !!res.length),
        switchMap((locations: Location[]) => {
          return this.passesService.getAggregatedPasses(locations.map(loc => loc.id));
        })
      ).subscribe(res => {
         this.currentPassesDates.clear();
         res.forEach((pass, i) => {
           this.currentPassesDates.set(new Date(pass.pass_date).toDateString(), i);
         });
    });

    this.hasPasses = combineLatest(
      this.liveDataService.myRoomActivePassesTotalNumber$,
      this.liveDataService.fromLocationPassesTotalNumber$,
      this.liveDataService.toLocationPassesTotalNumber$,
      (l1, l2, l3) => l1 + l2 + l3 > 0
    );
    this.passesLoaded = combineLatest(
      this.liveDataService.myRoomActivePassesLoaded$,
      this.liveDataService.fromLocationPassesLoaded$,
      this.liveDataService.toLocationPassesLoaded$,
      (l1, l2, l3) => l1 && l2 && l3
    ).pipe(
      filter(v => v),
      tap((res) => this.searchPending$.next(!res))
    );
  }

  ngOnDestroy() {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
    this.destroy$.next();
    this.destroy$.complete();
    this.locationService.myRoomSelectedLocation$.next(this.selectedLocation);
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

  openCalendar() {
    this.chooseDate(this.calendar.nativeElement as HTMLElement);
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
    const target = event.currentTarget;
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
      // Switch into kiosk mode

      this.storage.setItem('kioskToken', res.access_token);
      // this.storage.setItem('refresh_token', res.refresh_token);
      this.loginService.updateAuth({username: this.user.primary_email, type: 'demo-login', kioskMode: true});
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
      this.optionsOpen = true;
      UNANIMATED_CONTAINER.next(true);
      const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'heading': 'CHANGE ROOM',
          'locations': this.roomOptions,
          'selectedLocation': this.selectedLocation,
          'trigger': target,
          'scrollPosition': this.holdScrollPosition
        }
      });

      optionDialog.afterClosed()
        .pipe(
          tap(() => {
            UNANIMATED_CONTAINER.next(false);
            this.optionsOpen = false;
          }),
          filter(res => !!res)
        )
        .subscribe(data => {
          this.holdScrollPosition = data.scrollPosition;
          this.selectedLocation = data.selectedRoom === 'all_rooms' ? null : data.selectedRoom;
          this.selectedLocation$.next(data.selectedRoom !== 'all_rooms' ? [data.selectedRoom] : this.roomOptions);
        });
    }
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
    this.inputValue = '';
    this.searchQuery$.next('');
    this.toggleSearchBar();
  }

  onDate(event) {
    this.setSearchDate(event[0]._d);
  }

  openOptionsMenu() {
      const dialogRef = this.dialog.open(SortMenuComponent, {
        position: {bottom: '0'},
        panelClass: 'options-dialog',
        data: {
          title: 'change room',
          selectedItem: this.selectedLocation,
          items: this.roomOptions,
          showAll: true
        }
      });

      dialogRef.componentInstance.onListItemClick.subscribe((location) => {
        this.selectedLocation = location;
        this.selectedLocation$.next(this.selectedLocation !== null ? [this.selectedLocation] : this.roomOptions);
      });
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
    let maxWidth = 755;

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
