import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatDialog, MatDialogRef, MatDialogState} from '@angular/material/dialog';
// TODO: Replace combineLatest with non-deprecated implementation
import {BehaviorSubject, combineLatest, forkJoin, interval, merge, Observable, of, Subject} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  publishReplay,
  refCount,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {CreatePassDialogData} from '../create-hallpass-forms/create-hallpass-forms.component';
import {HallPassFilter, LiveDataService} from '../live-data/live-data.service';
import {exceptPasses} from '../models';
import {HallPass} from '../models/HallPass';
import {Request} from '../models/Request';
import {User} from '../models/User';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {NotificationService} from '../services/notification-service';
import {TimeService} from '../services/time.service';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NavbarDataService} from '../main/navbar-data.service';
import {PassesAnimations} from './passes.animations';
import {ScreenService} from '../services/screen.service';
import {ScrollPositionService} from '../scroll-position.service';
import {UserService} from '../services/user.service';
import {DeviceDetection} from '../device-detection.helper';
import {NotificationButtonService} from '../services/notification-button.service';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';

import {HttpService} from '../services/http-service';
import {HallPassesService} from '../services/hall-passes.service';
import {SideNavService} from '../services/side-nav.service';
import {StartPassNotificationComponent} from './start-pass-notification/start-pass-notification.component';
import {LocationsService} from '../services/locations.service';
import * as moment from 'moment';
import {PassLimitService} from '../services/pass-limit.service';
import {PassLimitInfo} from '../models/HallPassLimits';
import {MainHallPassFormComponent} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {CheckForUpdateService} from '../services/check-for-update.service';
import {Title} from '@angular/platform-browser';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';
import { WaitInLine } from '../models/WaitInLine'

@Component({
  selector: 'app-passes',
  templateUrl: './passes.component.html',
  styleUrls: ['./passes.component.scss'],
  animations: [
    PassesAnimations.OpenOrCloseRequests,
    PassesAnimations.PassesSlideTopBottom,
    PassesAnimations.RequestCardSlideInOut,
    PassesAnimations.HeaderSlideInOut,
    PassesAnimations.HeaderSlideTopBottom,
    PassesAnimations.PreventInitialChildAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PassesComponent implements OnInit, AfterViewInit, OnDestroy {

  private scrollableAreaName = 'Passes';
  private scrollableArea: HTMLElement;

  @ViewChild('animatedHeader') animatedHeader: ElementRef<HTMLElement>;

  @ViewChild('passesWrapper') passesWrapper: ElementRef<HTMLElement>;

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

  futurePasses: any;
  activePasses: any;
  pastPasses: any;
  waitInLinePasses: any;

  sentRequests: any;
  receivedRequests: any;

  currentPass$ = new BehaviorSubject<HallPass>(null);
  currentRequest$ = new BehaviorSubject<Request>(null);
  currentWaitInLine$ = new BehaviorSubject<WaitInLine>(null);

  isActivePass$: Observable<boolean>;
  isActiveRequest$: Observable<boolean>;
  isActiveWaitInLine$: Observable<boolean>;

  inboxHasItems: Observable<boolean> = of(null);
  passesHaveItems: Observable<boolean> = of(false);

  inboxLoaded: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  filterActivePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterFuturePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterReceivedPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterSendPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);

  filterExpiredPass$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  expiredPassesSelectedSort$: Observable<string>;
  isEmptyPassFilter: boolean;

  showEmptyState: Observable<boolean>;

  destroy$: Subject<any> = new Subject();

  user$: Observable<User>;
  user: User;
  passLimitInfo: PassLimitInfo;
  isStaff = false;
  currentScrollPosition: number;

  isUpdateBar$: Subject<any>;

  isInboxClicked$: Observable<boolean>;

  cursor = 'pointer';

  public schoolsLength$: Observable<number>;
  private createHallPassDialogRef: MatDialogRef<MainHallPassFormComponent>;

  @HostListener('window:resize')
  checkDeviceWidth() {
    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }
  }

  @HostListener('window:scroll', ['$event'])
  scroll(event) {
    this.currentScrollPosition = event.currentTarget.scrollTop;
    if (!!this.passesService.expiredPassesNextUrl$.getValue()) {
      if ((event.currentTarget.offsetHeight + event.target.scrollTop) >= (event.currentTarget.scrollHeight - 600)) {
        combineLatest(
          this.expiredPassesSelectedSort$.pipe(take(1)),
          this.liveDataService.expiredPassesLoading$.pipe(take(1))
        ).pipe(
          filter(([sort, loading]) => !loading),
          takeUntil(this.destroy$)
        )
          .subscribe(([sort, loading]) => {
            this.liveDataService.getExpiredPassesRequest(this.user, sort, this.passesService.expiredPassesNextUrl$.getValue());
          });
      }
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    if (this.isMobile) {
      this.navbarService.inboxClick$.next(false);
    }
  }

  showInboxAnimated() {
    return this.dataService.inboxState;
  }

  get showProfilePictures$(): Observable<boolean> {
    return combineLatest(
      this.userService.isEnableProfilePictures$,
      this.user$.pipe(filter(r => !!r), map(u => !User.fromJSON(u).isStudent() && u.show_profile_pictures === 'everywhere')),
      (c1, c2) => c1 && c2
    );
  }

  get isWaitInLine(): boolean {
    return this.featureService.isFeatureEnabled(FLAGS.WaitInLine);
  }

  get showInbox() {
    if (!this.isStaff) {
      return this.dataService.inboxState;
    } else if (!this.inboxHasItems && !this.passesHaveItems) {
      return of(false);
    } else {
      return of(true);
    }
  }

  // TODO: Move to constructor to calculate once
  get isSmartphone() {
    return DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile();
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private _zone: NgZone,
    private loadingService: LoadingService,
    private liveDataService: LiveDataService,
    private createFormService: CreateFormService,
    private notifService: NotificationService,
    private timeService: TimeService,
    private navbarService: NavbarDataService,
    public screenService: ScreenService,
    public darkTheme: DarkThemeSwitch,
    private scrollPosition: ScrollPositionService,
    private userService: UserService,
    private shortcutsService: KeyboardShortcutsService,
    private notificationButtonService: NotificationButtonService,
    private httpService: HttpService,
    private passesService: HallPassesService,
    private sideNavService: SideNavService,
    private locationsService: LocationsService,
    private passLimitsService: PassLimitService,
    private updateService: CheckForUpdateService,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private featureService: FeatureFlagService
  ) {

    this.userService.user$
      .pipe(
        take(1),
        map(user => {
          this.user = user;
          this.isStaff =
            user.roles.includes('_profile_teacher') ||
            user.roles.includes('_profile_admin') ||
            user.roles.includes('_profile_assistant');
          if (this.isStaff) {
            this.titleService.setTitle('SmartPass');
            this.dataService.updateInbox(true);
          } else {
            this.titleService.setTitle(`${user.display_name} | SmartPass`);
          }
          return user.roles.includes('hallpass_student');
        }), // TODO filter events to only changes.
        concatMap(isStudent => {

          if (!isStudent) {
            this.receivedRequests = this.liveDataService.requests$;
            this.sentRequests = this.liveDataService.invitations$;
            this.passLimitInfo = {showPasses: false};
            return of(null);
          }

          this.receivedRequests = this.liveDataService.invitations$;
          this.sentRequests = this.liveDataService.requests$.pipe(
            map(req => req.filter((r) => !!r.request_time)));

          return merge(
            this.liveDataService.watchActiveHallPasses(new Subject<HallPassFilter>()).pipe(
              distinctUntilChanged((a, b) => a.length === b.length)
            ),
            this.passLimitsService.watchPassLimits(),
            this.passLimitsService.watchIndividualPassLimit(this.user.id)
          ).pipe(
            concatMap(() => forkJoin({
              studentPassLimit: this.passLimitsService.getStudentPassLimit(this.user.id),
              remainingLimit: this.passLimitsService.getRemainingLimits({ studentId: this.user.id })
            })),
            map(({ studentPassLimit, remainingLimit }): PassLimitInfo => ({
              max: studentPassLimit.passLimit,
              showPasses: !studentPassLimit.noLimitsSet && !studentPassLimit.isUnlimited && studentPassLimit.passLimit !== null,
              current: remainingLimit.remainingPasses
            })),
            tap(data => {
              this.passLimitInfo = data;
              if (this.createHallPassDialogRef && this.createHallPassDialogRef.getState() === MatDialogState.OPEN) {
                this.createHallPassDialogRef.componentInstance.FORM_STATE.passLimitInfo = this.passLimitInfo;
                this.cdr.detectChanges();
              }
            })
          );
        })
      )
      .subscribe(() => {

      });

    this.isActivePass$ = combineLatest(this.currentPass$, this.timeService.now$, (pass, now) => {
      return pass !== null
        && new Date(pass.start_time).getTime() <= now.getTime()
        && now.getTime() < new Date(pass.end_time).getTime();
    }).pipe(publishReplay(1), refCount());

    this.isActiveRequest$ = this.currentRequest$.pipe(
      map(request => {
        return request !== null && !request.request_time;
      })
    );

    this.dataService.currentUser.pipe(
      takeUntil(this.destroy$),
      switchMap((user: User) => {
          console.log(user);
          return user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : of(null);
        }
      ))
      .subscribe(passLike => {
        this._zone.run(() => {
          if ((passLike instanceof HallPass || passLike instanceof Request) && this.currentScrollPosition) {
            this.scrollableArea.scrollTo({top: 0});
          }
          this.currentPass$.next((passLike instanceof HallPass) ? passLike : null);
          this.currentRequest$.next((passLike instanceof Request) ? passLike : null);
        });
      });

    merge(this.passesService.watchPassStart(), this.passesService.watchEndPass())
      .pipe(
        filter(() => !this.isStaff),
        switchMap(({action, data}) => {
          if (action === 'message.alert' && !this.dialog.getDialogById('startNotification')) {
            const isFirstPass: boolean = data.type.includes('first_pass');
            this.screenService.customBackdropEvent$.next(true);
            const SPNC = this.dialog.open(StartPassNotificationComponent, {
              id: 'startNotification',
              panelClass: 'main-form-dialog-container',
              backdropClass: 'notification-backdrop',
              disableClose: true,
              hasBackdrop: false,
              data: {
                title: isFirstPass ? 'Quick Reminder' : 'You didn’t end your pass last time…',
                subtitle: 'When you come back to the room, remember to end your pass!'
              }
            });
            SPNC.afterClosed().subscribe(() => this.screenService.customBackdropEvent$.next(false));
          } else if (action === 'hall_pass.end') {
            if (this.dialog.getDialogById('startNotification')) {
              this.dialog.getDialogById('startNotification').close();
              return of(true);
            }
          }
          return of(false);
        })
      )
      .subscribe(res => {
        if (res) {
          this.screenService.customBackdropEvent$.next(false);
        }
      });
  }

  ngOnInit() {
    this.isUpdateBar$ = this.updateService.needToUpdate$;
    this.futurePasses = this.liveDataService.futurePasses$;
    this.activePasses = this.getActivePasses();
    this.pastPasses = this.liveDataService.expiredPasses$;
    this.expiredPassesSelectedSort$ = this.passesService.passFilters$.pipe(
      filter(res => !!res),
      map(filters => {
        this.isEmptyPassFilter = !filters['past-passes'].default;
        return filters['past-passes'].default;
      }));
    this.schoolsLength$ = this.httpService.schoolsLength$;
    this.user$ = this.userService.user$;
    const notifBtnDismissExpires = moment(JSON.parse(localStorage.getItem('notif_btn_dismiss_expiration')));
    if (this.notificationButtonService.dismissExpirtationDate === notifBtnDismissExpires) {
      this.notificationButtonService.dismissButton$.next(false);
    }

    this.isInboxClicked$ = this.navbarService.inboxClick$.asObservable();

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroy$),
        filter((key) => key[0] === 'n' || key[0] === 'f')
      )
      .subscribe((key) => {
        if (key[0] === 'n') {
          this.showMainForm(false);
        } else if (key[0] === 'f') {
          this.showMainForm(true);
        }
      });

    this.inboxHasItems = combineLatest(
      this.liveDataService.requestsTotalNumber$,
      this.liveDataService.requestsLoaded$,
      this.liveDataService.invitationsTotalNumber$,
      this.liveDataService.invitationsLoaded$,
      (length1, loaded1, length2, loaded2) => {
        if (loaded1 && loaded2) {
          return (length1 + length2) > 0;
        }
      }
    );

    this.inboxLoaded = combineLatest(
      this.liveDataService.requestsLoaded$,
      this.liveDataService.invitationsLoaded$,
      (l1, l2) => l1 && l2
    );

    this.passesHaveItems = combineLatest(
      this.liveDataService.activePassesTotalNumber$,
      this.liveDataService.futurePassesTotalNumber$,
      this.liveDataService.expiredPassesTotalNumber$,
    ).pipe(map(([con1, con2, con3]) => !!con1 || !!con2 || !!con3));

    this.passesLoaded = combineLatest(
      this.liveDataService.activePassesLoaded$,
      this.liveDataService.futurePassesLoaded$,
      this.liveDataService.expiredPassesLoaded$,
      (con1, con2, con3) => con1 && con2 && con3
    );

    this.showEmptyState = combineLatest(this.passesHaveItems, this.passesLoaded)
      .pipe(map(([items, loaded]) => !items && loaded));

    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }

    this.httpService.globalReload$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationsService.getLocationsWithConfigRequest('v1/locations?limit=1000&starred=false');
        this.locationsService.getFavoriteLocationsRequest();
      });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  getActivePasses() {
    const passes$ = this.liveDataService.activePasses$.pipe(
      withLatestFrom(this.timeService.now$), map(([passes, now]) => {
        return passes.filter(pass => new Date(pass.start_time).getTime() <= now.getTime());
      })
    );
    const excludedPasses = this.currentPass$.pipe(map(p => p !== null ? [p] : []), startWith([]));
    return combineLatest(passes$, excludedPasses, (passes, excluded) => exceptPasses(passes, excluded));
  }

  showMainForm(forLater: boolean): void {
    this.createHallPassDialogRef = this.dialog.open(MainHallPassFormComponent, {
      closeOnNavigation: true,
      panelClass: 'main-form-dialog-container',
      backdropClass: 'custom-backdrop',
      maxWidth: '100vw',
      data: {
        forLater: forLater,
        forStaff: this.isStaff,
        forInput: true,
        passLimitInfo: this.passLimitInfo
      } as Partial<CreatePassDialogData>
    });
  }

  passClick(event) {
    this.passesService.isOpenPassModal$.next(true);
  }

  openSettings(value) {
    if (value && !this.dialog.openDialogs.length) {
      this.sideNavService.openSettingsEvent$.next(true);
    }
  }

  filterPasses(collection, action) {
    if (collection === 'active') {
      this.filterActivePass$.next(action);
    } else if (collection === 'future') {
      this.filterFuturePass$.next(action);
    } else if (collection === 'expired-passes') {
      this.filterExpiredPass$.next(action);
    } else if (collection === 'received-pass-requests') {
      this.filterReceivedPass$.next(action);
    } else if (collection === 'sent-pass-requests') {
      this.filterSendPass$.next(action);
    }
  }

  prepareFilter(action, collection) {
    if (action === 'past-hour') {
      this.filterPasses(collection, action);
    } else if (action === 'today') {
      this.filterPasses(collection, action);
    } else if (action === 'past-three-days') {
      this.filterPasses(collection, action);
    } else if (action === 'past-seven-days') {
      this.filterPasses(collection, action);
    } else {
      this.filterPasses(collection, null);
    }
  }
}
