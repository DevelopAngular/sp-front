import { Component, NgZone, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MatDialog } from '../../../node_modules/@angular/material';
import { Observable } from '../../../node_modules/rxjs';
import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { LiveDataService } from '../live-data.service';
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
    const sortReplay = new ReplaySubject<string>(1);
    sort.subscribe(sortReplay);

    return this.user$.switchMap(user => this.liveDataService.watchActiveHallPasses(sortReplay,
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
      data: {
        'pass': templatePass,
        'fromPast': false,
        'forFuture': forLater,
        'forInput': true,
        'forStaff': forStaff,
        'selectedStudents': selectedStudents
      }
    });
  }
}
