import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { mergeObject } from '../live-data/helpers';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../loading.service';
import { BasicPassLikeProvider, PassLikeProvider } from '../models';
import { HallPass } from '../models/HallPass';
import { testInvitations, testPasses, testRequests } from '../models/mock_data';
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
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.map(s => ({sort: s}));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, Observable.merge(sort$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);

    return this.user$.switchMap(user => this.liveDataService.watchActiveHallPasses(mergedReplay,
      user.roles.includes('hallpass_student')
        ? {type: 'student', value: user}
        : {type: 'issuer', value: user}));
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
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

  watch(sort: Observable<string>) {
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.switchMap(user => this.liveDataService.watchInboxRequests(user));
  }
}

class InboxInvitationProvider implements PassLikeProvider {
  constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
  }

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

  sentRequests: PassLikeProvider;
  receivedRequests: PassLikeProvider;

  currentPass: HallPass;
  currentRequest: Request;

  user: User;
  isStaff = false;

  constructor(public dataService: DataService, public dialog: MatDialog, private _zone: NgZone,
              private loadingService: LoadingService, private liveDataService: LiveDataService) {

    this.testPasses = new BasicPassLikeProvider(testPasses);
    this.testRequests = new BasicPassLikeProvider(testRequests);
    this.testInvitations = new BasicPassLikeProvider(testInvitations);

    this.futurePasses = new FuturePassProvider(this.liveDataService, this.dataService.currentUser);
    this.activePasses = new ActivePassProvider(this.liveDataService, this.dataService.currentUser);
    this.pastPasses = new PastPassProvider(this.liveDataService, this.dataService.currentUser);

    this.dataService.currentUser
      .map(user => user.roles.includes('hallpass_student')) // TODO filter events to only changes.
      .subscribe(isStudent => {
        if (isStudent) {
          this.receivedRequests = new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser);
          this.sentRequests = new InboxRequestProvider(this.liveDataService, this.dataService.currentUser);
        } else {
          this.receivedRequests = new InboxRequestProvider(this.liveDataService, this.dataService.currentUser);
          this.sentRequests = new InboxInvitationProvider(this.liveDataService, this.dataService.currentUser);
        }

      });

    this.dataService.currentUser.switchMap(user =>
      this.liveDataService.watchActivePassLike(user))
      .subscribe(passLike => {
        this._zone.run(() => {
          console.log('Active watch:', passLike);
          this.currentPass = (passLike instanceof HallPass) ? passLike : null;
          this.currentRequest = (passLike instanceof Request) ? passLike : null;
        });
      });

  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
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

    dialogRef.afterClosed().subscribe((result: Object) => {
      this.openInputCard(result['templatePass'],
        result['forLater'],
        result['forStaff'],
        result['selectedStudents'],
        (result['type'] === 'hallpass' ? PassCardComponent : (result['type'] === 'request' ? RequestCardComponent : InvitationCardComponent))
      );
    });
  }

  openInputCard(templatePass, forLater, forStaff, selectedStudents, component) {
    this.dialog.open(component, {
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      disableClose: true,
      data: {
        'pass': templatePass,
        'fromPast': false,
        'forFuture': forLater,
        'forInput': true,
        'forStaff': forStaff,
        'selectedStudents': selectedStudents,
      }
    });
  }
}
