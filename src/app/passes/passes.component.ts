import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, combineLatest, ConnectableObservable, empty, interval, merge, Observable, of, ReplaySubject, Subject,} from 'rxjs';
import {
  filter,
  map,
  pluck,
  publishBehavior,
  publishReplay,
  refCount,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {mergeObject} from '../live-data/helpers';
import {HallPassFilter, LiveDataService} from '../live-data/live-data.service';
import {exceptPasses, PassLike} from '../models';
import {HallPass} from '../models/HallPass';
import {testInvitations, testPasses, testRequests} from '../models/mock_data';
import {BasicPassLikeProvider, PassLikeProvider, WrappedProvider} from '../models/providers';
import {Request} from '../models/Request';
import {User} from '../models/User';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {NotificationService} from '../services/notification-service';
import {TimeService} from '../services/time.service';
import {ReportSuccessToastComponent} from '../report-success-toast/report-success-toast.component';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NavbarDataService} from '../main/navbar-data.service';
import {PassesAnimations} from './passes.animations';
import {ScreenService} from '../services/screen.service';
import {ScrollPositionService} from '../scroll-position.service';
import {UserService} from '../services/user.service';
import {DeviceDetection} from '../device-detection.helper';
import * as moment from 'moment';
import {NotificationButtonService} from '../services/notification-button.service';

import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {HttpService} from '../services/http-service';
import {HallPassesService} from '../services/hall-passes.service';
import {SideNavService} from '../services/side-nav.service';
import {StartPassNotificationComponent} from './start-pass-notification/start-pass-notification.component';
import {LocationsService} from '../services/locations.service';

export class FuturePassProvider implements PassLikeProvider {
  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private filterDate$?: Observable<moment.Moment>
  ) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return combineLatest(this.user$, this.filterDate$).pipe(
      switchMap(([user, date]) => this.liveDataService.watchFutureHallPasses(
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user})
        .pipe(
          map(passes => {
            if (date) {
              return passes.filter(pass => moment(pass.start_time).isAfter(moment(date)));
            }
            return passes;
          })
        )
      )
    );
  }
}

export class ActivePassProvider implements PassLikeProvider {
  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private excluded$: Observable<PassLike[]> = empty(),
    private timeService: TimeService,
    private filterDate$?: Observable<moment.Moment>
    ) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.pipe(map(s => ({sort: s})));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    const passes$ = this.user$.pipe(
      switchMap(user => {
        return this.liveDataService.watchActiveHallPasses(mergedReplay,
            user.roles.includes('hallpass_student')
              ? {type: 'student', value: user}
              : {type: 'issuer', value: user}
              );
        }
      ),
      withLatestFrom(this.timeService.now$), map(([passes, now]) => {
        console.log(passes);
        return passes.filter(pass => new Date(pass.start_time).getTime() <= now.getTime());
      })
    );

    const excluded$ = this.excluded$.pipe(startWith([]));

    return combineLatest(passes$, excluded$, (passes, excluded) => exceptPasses(passes, excluded));
  }
}

export class PastPassProvider implements PassLikeProvider {
  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private filterDate$?: Observable<moment.Moment>
  ) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return combineLatest(this.user$, this.filterDate$)
      .pipe(
        switchMap(([user, date]) => {
          return this.liveDataService.watchPastHallPasses(
            user.roles.includes('hallpass_student')
                ? {type: 'student', value: user}
                : {type: 'issuer', value: user}
            )
            .pipe(
              map(passes => {
                if (date) {
                  return passes.filter(pass => {
                    // console.log(moment(pass.start_time).isAfter(moment(date)));
                    // debugger;
                    return moment(pass.start_time).isAfter(moment(date));
                  });
                }
                return passes;
              })
          );
          }
        )
      );
  }
}

export class InboxRequestProvider implements PassLikeProvider {

  isStudent: boolean;

  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private filterDate$?: Observable<moment.Moment>
  ) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return combineLatest(this.user$, this.filterDate$).pipe(
      switchMap(([user, date]) => {
        this.isStudent = user.isStudent();
        return this.liveDataService.watchInboxRequests(user)
          .pipe(
            map(passes => {
              if (date) {
                return passes.filter(pass => moment(pass.request_time).isAfter(moment(date)));
              }
              return passes;
            })
          );
    }))
      .pipe(
        map(req => {
          if (this.isStudent) {
            return req.filter((r) => !!r.request_time);
          }
          return req;
      }));
  }

}

export class InboxInvitationProvider implements PassLikeProvider {
  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private filterDate$?: Observable<moment.Moment>
  ) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return combineLatest(this.user$, this.filterDate$).pipe(
      switchMap(([user, date ]) => this.liveDataService.watchInboxInvitations(user)
        .pipe(
          map(passes => {
            if (date) {
              return passes.filter(pass => moment(pass.date_choices[0]).isAfter(moment(date)));
            } else {
              return passes;
            }
        }))
      ),
    );
  }
}

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
            console.log('Subscribe ==>>', v);
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
  testRequests: PassLikeProvider;
  testInvitations: PassLikeProvider;

  futurePasses: WrappedProvider;
  activePasses: WrappedProvider;
  pastPasses: WrappedProvider;

  sentRequests: WrappedProvider;
  receivedRequests: WrappedProvider;

  currentPass$ = new BehaviorSubject<HallPass>(null);
  currentRequest$ = new BehaviorSubject<Request>(null);

  isActivePass$: Observable<boolean>;
  isActiveRequest$: Observable<boolean>;
  inboxHasItems: Observable<boolean> = of(null);
  passesHaveItems: Observable<boolean> = of(false);

  inboxLoaded: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  filterActivePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterFuturePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterExpiredPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterReceivedPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
  filterSendPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);

  showEmptyState: Observable<boolean>;


  isOpenedModal: boolean;
  destroy$: Subject<any> = new Subject();

  user: User;
  isStaff = false;
  isSeen$: BehaviorSubject<boolean>;
  currentScrollPosition: number;

  isInboxClicked$: Observable<boolean>;

  cursor = 'pointer';
  shownotificationBackdrop: boolean;

  public schoolsLength$: Observable<number>;

  @HostListener('window:resize')
  checkDeviceWidth() {
    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }
  }

  @HostListener('window:scroll', ['$event'])
  scroll(event) {
    this.currentScrollPosition = event.currentTarget.scrollTop;
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

  get showInbox() {
    if (!this.isStaff) {
      return this.dataService.inboxState;
    } else if (!this.inboxHasItems && !this.passesHaveItems) {
      return of(false);
    } else {
      return of(true);
    }
  }

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
    private  notificationButtonService: NotificationButtonService,
    private httpService: HttpService,
    private passesService: HallPassesService,
    private sideNavService: SideNavService,
    private locationsService: LocationsService
  ) {

    this.testPasses = new BasicPassLikeProvider(testPasses);
    this.testRequests = new BasicPassLikeProvider(testRequests);
    this.testInvitations = new BasicPassLikeProvider(testInvitations);

    const excludedPasses = this.currentPass$.pipe(map(p => p !== null ? [p] : []));

    const dbUser$ = combineLatest(
      this.userService.effectiveUser.asObservable(),
      this.dataService.currentUser
    ).pipe(
      map(([effectUser, currentUser]) => {
        if (effectUser) {
          return effectUser.user;
        } else {
          return currentUser;
        }
      }));

    this.futurePasses = new WrappedProvider(new FuturePassProvider(this.liveDataService, dbUser$, this.filterFuturePass$.asObservable()));
    this.activePasses = new WrappedProvider(new ActivePassProvider(this.liveDataService, dbUser$, excludedPasses, this.timeService, this.filterActivePass$.asObservable()));
    this.pastPasses = new WrappedProvider(new PastPassProvider(this.liveDataService, dbUser$, this.filterExpiredPass$.asObservable()));

    this.dataService.currentUser
      .pipe(
        map(user => {
          this.user = user;
          this.isStaff =
            user.roles.includes('_profile_teacher') ||
            user.roles.includes('_profile_admin') ||
            user.roles.includes('_profile_assistant');
          if (this.isStaff) {
            this.dataService.updateInbox(true);
          }
          return user.roles.includes('hallpass_student');
        }) // TODO filter events to only changes.
      )
      .subscribe(isStudent => {
        const excludedRequests = this.currentRequest$.pipe(map(r => r !== null ? [r] : []));

        if (isStudent) {
          this.receivedRequests = new WrappedProvider(
            new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser, this.filterReceivedPass$.asObservable())
          );
          this.sentRequests = new WrappedProvider(
            new InboxRequestProvider(this.liveDataService, this.dataService.currentUser, this.filterSendPass$.asObservable())
          );
        } else {
          this.receivedRequests = new WrappedProvider(
            new InboxRequestProvider(this.liveDataService, this.dataService.currentUser, this.filterReceivedPass$.asObservable())
          );
          this.sentRequests = new WrappedProvider(
            new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser, this.filterSendPass$.asObservable())
          );
        }
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
      switchMap((user: User) =>
        user.isStudent() ? this.liveDataService.watchActivePassLike(user) : of(null))
    )
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
          if (action === 'message.alert') {
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
            return SPNC.afterClosed();
          } else if (action === 'hall_pass.end') {
            if (this.dialog.getDialogById('startNotification')) {
              this.dialog.getDialogById('startNotification').close();
              return of(true);
            }
          }
          return of(null);
        })
      )
      .subscribe(res => {
        this.screenService.customBackdropEvent$.next(false);
      });
  }

  ngOnInit() {
    this.schoolsLength$ = this.httpService.schoolsLength$;
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
      this.receivedRequests.length$,
      this.receivedRequests.loaded$,
      this.sentRequests.length$,
      this.sentRequests.loaded$,
      (length1, loaded1, length2, loaded2) => {
        if (loaded1 && loaded2) {
          return (length1 + length2) > 0;
        }
      }
    );

    this.inboxLoaded = combineLatest(
      this.receivedRequests.loaded$,
      this.sentRequests.loaded$,
      (l1, l2) => l1 && l2
    );

    this.passesHaveItems = combineLatest(
      this.activePasses.length$,
      this.futurePasses.length$,
      this.pastPasses.length$,
      this.filterExpiredPass$
    ).pipe(map(([con1, con2, con3, passFilter]) => !con1 && !con2 && !con3 && !passFilter));

    this.passesLoaded = combineLatest(
      this.activePasses.loaded$,
      this.futurePasses.loaded$,
      this.pastPasses.loaded$,
    ).pipe(map(([con1, con2, con3]) => con1 && con2 && con3));

    this.showEmptyState = combineLatest(this.passesHaveItems, this.passesLoaded)
      .pipe(map(([items, loaded]) => items && loaded), publishBehavior(true));
    (this.showEmptyState as ConnectableObservable<boolean>).connect();

    this.isSeen$ = this.createFormService.isSeen$;

    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }

    this.locationsService.getLocationsWithConfigRequest('v1/locations?limit=1000&starred=false');
    this.locationsService.getFavoriteLocationsRequest();
    this.locationsService.getPassLimitRequest();

    this.passesService.getFiltersRequest('expired-passes');
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

  showMainForm(forLater: boolean): void {
    if (!this.isOpenedModal) {
      this.isOpenedModal = true;
      const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
        panelClass: 'main-form-dialog-container',
        backdropClass: 'custom-backdrop',
        maxWidth: '100vw',
        data: {
          'forLater': forLater,
          'forStaff': this.isStaff,
          'forInput': true
        }
      });

      mainFormRef.afterClosed().subscribe(res => {
        this.isOpenedModal = false;
      });
    }
  }

  onReportFromPassCard(evt) {
    if (evt) {
      this.dialog.open(ReportSuccessToastComponent, {
        backdropClass: 'invisible-backdrop',
        panelClass: 'main-form-dialog-container',
        position: {
          bottom: '50px'
        }
      });
    }
  }

  passClick(event) {
    this.passesService.isOpenPassModal$.next(true);
  }

  openSettings(value) {
    if (value && !this.dialog.openDialogs.length) {
      this.sideNavService.openSettingsEvent$.next(true);
    }
  }

  filterPasses(collection, date) {
    if (collection === 'active') {
      this.filterActivePass$.next(date);
    } else if (collection === 'future') {
      this.filterFuturePass$.next(date);
    } else if (collection === 'expired-passes') {
      this.filterExpiredPass$.next(date);
    } else if (collection === 'received-pass-requests') {
      this.filterReceivedPass$.next(date);
    } else if (collection === 'sent-pass-requests') {
      this.filterSendPass$.next(date);
    }
  }

  prepareFilter(action, collection) {
    if (action === 'past-hour') {
      this.filterPasses(collection, moment().subtract(1, 'hours'));
    } else if (action === 'today') {
      this.filterPasses(collection, moment().startOf('day'));
    } else if (action === 'past-three-days') {
      this.filterPasses(collection, moment().subtract(3, 'days').startOf('day'));
    } else if (action === 'past-seven-days') {
      this.filterPasses(collection, moment().subtract(7, 'days').startOf('day'));
    } else {
      this.filterPasses(collection, null);
    }
  }
}
