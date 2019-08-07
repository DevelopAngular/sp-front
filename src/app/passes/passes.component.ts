import {AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material';
import {
  BehaviorSubject,
  combineLatest,
  ConnectableObservable,
  empty, fromEvent, interval,
  merge,
  Observable,
  of, pipe,
  ReplaySubject, Subject,
} from 'rxjs';
import {
  delay,
  filter,
  map, publishBehavior,
  publishReplay,
  refCount,
  startWith,
  switchMap, takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { mergeObject } from '../live-data/helpers';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { exceptPasses, PassLike } from '../models';
import { HallPass } from '../models/HallPass';
import { testInvitations, testPasses, testRequests } from '../models/mock_data';
import { BasicPassLikeProvider, PassLikeProvider, WrappedProvider } from '../models/providers';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification-service';
import { TimeService } from '../services/time.service';
import {ReportSuccessToastComponent} from '../report-success-toast/report-success-toast.component';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NavbarDataService} from '../main/navbar-data.service';
import {PassesAnimations} from './passes.animations';
import {ScreenService} from '../services/screen.service';
import {ScrollPositionService} from '../scroll-position.service';
import {init} from '@sentry/browser';

export class FuturePassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.pipe(switchMap(user => this.liveDataService.watchFutureHallPasses(
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user})));
  }
}

export class ActivePassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>,
              private excluded$: Observable<PassLike[]> = empty(), private timeService: TimeService) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.pipe(map(s => ({sort: s})));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    const passes$ = this.user$.pipe(
      switchMap(user => this.liveDataService.watchActiveHallPasses(mergedReplay,
        user.roles.includes('hallpass_student')
          ? {type: 'student', value: user}
          : {type: 'issuer', value: user})),
      withLatestFrom(this.timeService.now$), map(([passes, now]) => {
        return passes.filter(pass => new Date(pass.start_time).getTime() <= now.getTime());
      })
    );

    const excluded$ = this.excluded$.pipe(startWith([]));

    return combineLatest(passes$, excluded$, (passes, excluded) => exceptPasses(passes, excluded));
  }
}

export class PastPassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$
      .pipe(
        switchMap(user => this.liveDataService.watchPastHallPasses(
          user.roles.includes('hallpass_student')
            ? {type: 'student', value: user}
            : {type: 'issuer', value: user}
          )
        )
      );
  }
}

export class InboxRequestProvider implements PassLikeProvider {

  isStudent: boolean;

  constructor(
    private liveDataService: LiveDataService,
    private user$: Observable<User>,
    private excluded$: Observable<PassLike[]> = empty(),
    private dataService: DataService) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    const requests$ = this.user$.pipe(switchMap(user => {
      this.isStudent = user.isStudent();
      return this.liveDataService.watchInboxRequests(user);
    }))
      .pipe(map(req => {
        if (this.isStudent) {
          return req.filter((r) => !!r.request_time);
        }
        return req;
      }));

    return requests$;
  }

}

export class InboxInvitationProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    const invitations$ = this.user$.pipe(switchMap(user => this.liveDataService.watchInboxInvitations(user)),
      map(inv => {
        return inv;
      }));

    return invitations$;
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
  ],
})
export class PassesComponent implements OnInit, AfterViewInit, OnDestroy {

  private scrollableAreaName = 'Passes';
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

  showEmptyState: Observable<boolean>;

  user: User;
  isStaff = false;
  isSeen$: BehaviorSubject<boolean>;

  isInboxClicked: boolean;

  cursor = 'pointer';

  showInboxAnimated() {
    return this.dataService.inboxState;
  }

  get showInbox() {
    if (!this.isStaff) {
      // console.log('|||||||||||||| Student Now ===>', this.dataService.inboxState);
      return this.dataService.inboxState;
    } else if (!this.inboxHasItems && !this.passesHaveItems) {
      return of(false);
    } else {
      return of(true);
    }
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
    private scrollPosition: ScrollPositionService

  ) {

    this.testPasses = new BasicPassLikeProvider(testPasses);
    this.testRequests = new BasicPassLikeProvider(testRequests);
    this.testInvitations = new BasicPassLikeProvider(testInvitations);

    const excludedPasses = this.currentPass$.pipe(map(p => p !== null ? [p] : []));

    this.futurePasses = new WrappedProvider(new FuturePassProvider(this.liveDataService, this.dataService.currentUser));
    this.activePasses = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.dataService.currentUser, excludedPasses, this.timeService));
    this.pastPasses = new WrappedProvider(new PastPassProvider(this.liveDataService, this.dataService.currentUser));

    this.dataService.currentUser
      .pipe(
        map(user => user.roles.includes('hallpass_student')) // TODO filter events to only changes.
      ).subscribe(isStudent => {
      const excludedRequests = this.currentRequest$.pipe(map(r => r !== null ? [r] : []));

      if (isStudent) {
        this.receivedRequests = new WrappedProvider(new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser));
        this.sentRequests = new WrappedProvider(new InboxRequestProvider(this.liveDataService, this.dataService.currentUser,
          excludedRequests, this.dataService));
      } else {
        this.receivedRequests = new WrappedProvider(new InboxRequestProvider(this.liveDataService, this.dataService.currentUser,
          excludedRequests, this.dataService));
        this.sentRequests = new WrappedProvider(new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser));
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
        user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : of(null))
    )
      .subscribe(passLike => {
        this._zone.run(() => {
          this.currentPass$.next((passLike instanceof HallPass) ? passLike : null);
          this.currentRequest$.next((passLike instanceof Request) ? passLike : null);
        });
      });
  }

  ngOnInit() {
    this.navbarService.inboxClick.subscribe(inboxClick => {
      this.isInboxClicked = inboxClick;
    });
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('_profile_teacher') || user.roles.includes('_profile_admin');
          if (this.isStaff) {
            this.dataService.updateInbox(true);
          }
        });
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
    ).pipe(map(([con1, con2, con3]) => !con1 && !con2 && !con3));

    this.passesLoaded = combineLatest(
      this.activePasses.loaded$,
      this.futurePasses.loaded$,
      this.pastPasses.loaded$,
    ).pipe(map(([con1, con2, con3]) => con1 && con2 && con3));

    this.showEmptyState = combineLatest(this.passesHaveItems, this.passesLoaded)
      .pipe(map(([items, loaded]) => items && loaded), publishBehavior(true));
    (this.showEmptyState as ConnectableObservable<boolean>).connect();

    this.isSeen$ = this.createFormService.isSeen$;
    //
    // this.notifService.initNotifications(true)
    //   .then(hasPerm => console.log(`Has permission to show notifications: ${hasPerm}`));

    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }
  }
  ngAfterViewInit(): void {
  //   console.log(this.scrollPosition.getComponentScroll(this.scrollableAreaName));
  //   this.scrollableArea.scrollTo({top: this.scrollPosition.getComponentScroll(this.scrollableAreaName), behavior: 'smooth'});
  }

  ngOnDestroy(): void {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
  }

  showMainForm(forLater: boolean): void {
    const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
      panelClass: 'main-form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        'forLater': forLater,
        'forStaff': this.isStaff,
        'forInput': true
      }
    });
  }

  onReportFromPassCard(evt) {
    console.log(evt);
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

  @HostListener('window:resize')
  checkDeviceWidth() {
    if (this.screenService.isDeviceLargeExtra) {
      this.cursor = 'default';
    }
  }
}
