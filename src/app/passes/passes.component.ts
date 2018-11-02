import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import {filter, map, switchMap, withLatestFrom} from 'rxjs/operators';

import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { mergeObject } from '../live-data/helpers';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../loading.service';
import { exceptPasses, PassLike } from '../models';
import { HallPass } from '../models/HallPass';
import { testInvitations, testPasses, testRequests } from '../models/mock_data';
import { BasicPassLikeProvider, PassLikeProvider, WrappedProvider } from '../models/providers';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { RequestCardComponent } from '../request-card/request-card.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

class FuturePassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.switchMap(user => this.liveDataService.watchFutureHallPasses(
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user}));
  }
}

class ActivePassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>,
              private excluded$: Observable<PassLike[]> = Observable.empty()) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.map(s => ({sort: s}));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, Observable.merge(sort$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    const passes$ = this.user$.switchMap(user => this.liveDataService.watchActiveHallPasses(mergedReplay,
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user}))
        .pipe(map(passes => {
              const now = new Date();
              return passes.filter(pass => pass.start_time.getTime() <= now.getTime());
    }));

    const excluded$ = this.excluded$.startWith([]);

    return Observable.combineLatest(passes$, excluded$, (passes, excluded) => exceptPasses(passes, excluded));
  }
}

class PastPassProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.switchMap(user => this.liveDataService.watchPastHallPasses(
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user}));
  }
}

class InboxRequestProvider implements PassLikeProvider {

  constructor(
      private liveDataService: LiveDataService,
      private user$: Observable<User>,
      private excluded$: Observable<PassLike[]> = Observable.empty(),
      private dataService: DataService) {
  }

  watch(sort: Observable<string>) {
      const sortReplay = new ReplaySubject<string>(1);
      sort.subscribe(sortReplay);

     return this.user$.pipe(switchMap(user => this.liveDataService.watchInboxRequests(user)));
  }

}

class InboxInvitationProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {}

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.switchMap(user => this.liveDataService.watchInboxInvitations(user));
  }
}


@Component({
  selector: 'app-passes',
  templateUrl: './passes.component.html',
  styleUrls: ['./passes.component.scss']
})
export class PassesComponent implements OnInit {

  testPasses: PassLikeProvider;
  testRequests: PassLikeProvider;
  testInvitations: PassLikeProvider;

  futurePasses: PassLikeProvider;
  activePasses: PassLikeProvider;
  pastPasses: PassLikeProvider;

  sentRequests: WrappedProvider;
  receivedRequests: WrappedProvider;

  private currentPass$ = new BehaviorSubject<HallPass>(null);
  private currentRequest$ = new BehaviorSubject<Request>(null);
  private isActivePass$ = this.dataService.isActivePass$;
  private isActiveRequest$ = this.dataService.isActiveRequest$;

  inboxHasItems: Observable<boolean> = Observable.of(false);

  user: User;
  isStaff = false;

  constructor(public dataService: DataService, public dialog: MatDialog, private _zone: NgZone,
              private loadingService: LoadingService, private liveDataService: LiveDataService) {

    this.testPasses = new BasicPassLikeProvider(testPasses);
    this.testRequests = new BasicPassLikeProvider(testRequests);
    this.testInvitations = new BasicPassLikeProvider(testInvitations);

    const excludedPasses = this.currentPass$.map(p => p !== null ? [p] : []);

    this.futurePasses = new FuturePassProvider(this.liveDataService, this.dataService.currentUser);
    this.activePasses = new ActivePassProvider(this.liveDataService, this.dataService.currentUser, excludedPasses);
    this.pastPasses = new PastPassProvider(this.liveDataService, this.dataService.currentUser);

    this.dataService.currentUser
      .map(user => user.roles.includes('hallpass_student')) // TODO filter events to only changes.
      .subscribe(isStudent => {
        const excludedRequests = this.currentRequest$.map(r => r !== null ? [r] : []);

        if (isStudent) {
          this.receivedRequests = new WrappedProvider(new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser));
          this.sentRequests = new WrappedProvider(new InboxRequestProvider(this.liveDataService, this.dataService.currentUser,
            excludedRequests, this.dataService));
        } else {
          this.receivedRequests = new WrappedProvider(new InboxRequestProvider(this.liveDataService, this.dataService.currentUser,
            excludedRequests, this.dataService));
          this.sentRequests = new WrappedProvider(new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser));
        }

        this.inboxHasItems = Observable.combineLatest(
          this.receivedRequests.length$.startWith(0),
          this.sentRequests.length$.startWith(0),
          (l1, l2) => l1 > 0 || l2 > 0
        );

      });

    this.dataService.currentUser.switchMap(user =>
      user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : Observable.of(null))
      .subscribe(passLike => {
        if (passLike) {
            const nowDate = new Date();
            const startDate = new Date(passLike.start_time);
            const endDate = new Date(passLike.end_time);
            if (nowDate.getTime() >= startDate.getTime() && nowDate.getTime() !== endDate.getTime()) {
                this.dataService.isActivePass$.next(true);
            }
            if (!(!!passLike.request_time) && passLike.status) {
              this.dataService.isActiveRequest$.next(true);
            }
        }
        this._zone.run(() => {
          this.currentPass$.next((passLike instanceof HallPass) ? passLike : null);
          this.currentRequest$.next((passLike instanceof Request) ? passLike : null);
        });
      });

  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }

  get currentPass() {
    return this.currentPass$.value;
  }

  get isActivePass() {
    return this.isActivePass$.value;
  }

  get currentRequest() {
    return this.currentRequest$.value;
  }

  get isActiveRequest() {
    return this.isActiveRequest$.value;
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });
      });
  }

  showForm(forLater: boolean): void {
    const dialogRef = this.dialog.open(HallpassFormComponent, {
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
    let data = {
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
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      disableClose: true,
      data: data
    });
    console.log(data);
  }
}
