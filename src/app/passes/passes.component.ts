import { animate, state, style, transition, trigger, } from '@angular/animations';
import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BehaviorSubject, combineLatest, empty, merge, Observable, of, ReplaySubject } from 'rxjs';
import {
    debounceTime,
    delay,
    filter,
    map,
    publishReplay,
    refCount,
    startWith,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { mergeObject } from '../live-data/helpers';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { exceptPasses, PassLike } from '../models';
import { HallPass } from '../models/HallPass';
import { testInvitations, testPasses, testRequests } from '../models/mock_data';
import { BasicPassLikeProvider, PassLikeProvider, WrappedProvider } from '../models/providers';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { RequestCardComponent } from '../request-card/request-card.component';

import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification-service';
import { TimeService } from '../services/time.service';
import {ReportSuccessToastComponent} from '../report-success-toast/report-success-toast.component';
import * as moment from 'moment';
import {Invitation} from '../models/Invitation';
import {DarkThemeSwitch} from '../dark-theme-switch';

declare const window;


function isUserStaff(user: User): boolean {
  return user.roles.includes('_profile_teacher');
}

class FuturePassProvider implements PassLikeProvider {
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

class ActivePassProvider implements PassLikeProvider {
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

class PastPassProvider implements PassLikeProvider {
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

class InboxRequestProvider implements PassLikeProvider {

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

class InboxInvitationProvider implements PassLikeProvider {
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
    trigger('OpenOrCloseRequests', [
        state('Opened', style({
          display: 'block',
          width: '351px',
          opacity: 1,
          // transform: 'translateX(0px)',
          'margin-right': '0px',

        })),
        state('Closed', style({
          display: 'none',
          width: '351px',
          opacity: 0,
          'margin-right': '-351px'
          // transform: 'translateX(50px)',
        })),

        transition('Opened => Closed', [
          animate('.5s 0s ease',  style({
            width: '351px',
            opacity: 0,
            // transform: 'translateX(50px)',
            'margin-right': '-351px',
            display: 'none',
          }))]),
        transition('Closed => Opened', [
          style({
            display: 'block'
          }),
          animate('.5s 0s ease',  style({
            display: 'block',
            width: '351px',
            opacity: 1,
            'margin-right': '0px',

            // transform: 'translateX(0px)',
          }))]),
      ],
    ),
  ]
})
export class PassesComponent implements OnInit {

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
  noRequests: boolean = false;
  // inboxHasItems: Subject<boolean> = new Subject<boolean>();
  inboxHasItems: Observable<boolean> = of(null);
  passesHaveItems: Observable<boolean> = of(false);

  inboxLoaded: Observable<boolean> = of(false);
  passesLoaded: Observable<boolean> = of(false);

  user: User;
  isStaff = false;
  isSeen$: BehaviorSubject<boolean>;

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
    public darkTheme: DarkThemeSwitch

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

        // zip(
        //   this.receivedRequests.length$.asObservable(),
        //   this.sentRequests.length$.asObservable()
        // ).pipe(
        //   skip(2)
        // ).subscribe((val) => {
        //   this.inboxHasItems.next(!val.reduce((a, b) => a + b));
        //   // console.log('==============================================>', val);
        // });

        // this.inboxHasItems = combineLatest(
        //   this.receivedRequests.length$.startWith(0),
        //   this.sentRequests.length$.startWith(0),
        //   (l1, l2) => l1 > 0 || l2 > 0
        // );
        //   this.receivedRequests.length$


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
    window.appLoaded();
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('_profile_teacher') || user.roles.includes('_profile_admin');
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

    this.passesHaveItems = merge(
      this.activePasses.length$,
      this.futurePasses.length$,
      this.pastPasses.length$,
    ).pipe(map(con => !!con));

    this.passesLoaded = merge(
      this.activePasses.loaded$,
      this.futurePasses.loaded$,
      this.pastPasses.loaded$,
    ).pipe(map(con => !!con), delay(150));

    this.isSeen$ = this.createFormService.isSeen$;
    //
    // this.notifService.initNotifications(true)
    //   .then(hasPerm => console.log(`Has permission to show notifications: ${hasPerm}`));
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

  showFirstSeenForm(forLater: boolean): void {
    const dialogRef = this.dialog.open(CreateHallpassFormsComponent, {
      width: '750px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {'forLater': forLater, 'forStaff': this.isStaff}
    });

    dialogRef.afterClosed()
      .pipe(filter(res => !!res)).subscribe((result: Object) => {
      this.openInputCard(result['templatePass'],
        result['forLater'],
        result['forStaff'],
        result['selectedStudents'],
        (result['type'] === 'hallpass' ? PassCardComponent : (result['type'] === 'request' ? RequestCardComponent : InvitationCardComponent)),
        result['fromHistory'],
        result['fromHistoryIndex']
      );
    });
  }

  openInputCard(templatePass, forLater, forStaff, selectedStudents, component, fromHistory, fromHistoryIndex) {
    const data = {
      'pass': templatePass,
      'fromPast': false,
      'fromHistory': fromHistory,
      'fromHistoryIndex': fromHistoryIndex,
      'forFuture': forLater,
      'forInput': true,
      'forStaff': forStaff,
      'selectedStudents': selectedStudents,
    };

    this.dialog.open(component, {
      panelClass: (this.isStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      disableClose: true,
      data: data
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
}
