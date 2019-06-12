import {Component, HostListener, NgZone, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {map, switchMap} from 'rxjs/operators';
import {ScreenService} from '../services/screen.service';
import {SideNavService} from '../services/side-nav.service';
import {BehaviorSubject, combineLatest, empty, Observable, of, ReplaySubject} from 'rxjs';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {PassLikeProvider, WrappedProvider} from '../models/providers';
import {LiveDataService} from '../live-data/live-data.service';
import {Request} from '../models/Request';
import {User} from '../models/User';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {InboxInvitationProvider, InboxRequestProvider} from '../passes/passes.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  constructor(
    public userService: UserService,
    public darkTheme: DarkThemeSwitch,
    private createFormService: CreateFormService,
    private screenService: ScreenService,
    private sideNavService: SideNavService,
    private dataService: DataService,
    private loadingService: LoadingService,
    private liveDataService: LiveDataService,
    private _zone: NgZone,
  ) {

    const excludedRequests = this.currentRequest$.pipe(map(r => r !== null ? [r] : []));

    this.dataService.currentUser
      .pipe(
        map(user => user.roles.includes('hallpass_student')) // TODO filter events to only changes.
      ).subscribe(isStudent => {

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

    this.dataService.currentUser.pipe(
      switchMap((user: User) =>
        user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : of(null))
    )
      .subscribe(passLike => {
        this._zone.run(() => {
          this.currentRequest$.next((passLike instanceof Request) ? passLike : null);
        });
      });
  }

  inboxHasItems: Observable<boolean> = of(null);
  currentRequest$ = new BehaviorSubject<Request>(null);
  toggleLeft: Observable<boolean> = new Observable<boolean>();
  toggleRight: Observable<boolean> = new Observable<boolean>();
  sentRequests: WrappedProvider;
  receivedRequests: WrappedProvider;
  isStaff: boolean;
  data: any;

  ngOnInit() {
    this.createFormService.seen();
    this.toggleLeft = this.sideNavService.toggleLeft;
    this.toggleRight = this.sideNavService.toggleRight;

    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this.isStaff = user.roles.includes('_profile_teacher') || user.roles.includes('_profile_admin');
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
  }

  get showInbox() {
    if (!this.isStaff) {
      return this.dataService.inboxState;
    } else if (!this.inboxHasItems) {
      return of(false);
    } else {
      return of(true);
    }
  }

  isTeacher() {
    return true;
    // TODO when the roles of teachers will be ready
    //   return this.currentUser.roles.includes('_profile_teacher');
  }

  shouldShowRouter() {
    return this.userService.userData.pipe(map(u => u.isStudent() || u.isTeacher() || u.isAssistant()));
  }

  onSettingClick($event) {
    if (this.screenService.isDeviceLarge) {
      this.data = $event;
      this.sideNavService.toggle$.next(true);
    }
  }

  fadeClick() {
    this.sideNavService.toggleLeft$.next(false);
    this.sideNavService.toggleRight$.next(false);
    this.sideNavService.sideNavAction$.next('');
    this.sideNavService.fadeClick$.next(true);
  }

  get titleColor () {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});
  }

  @HostListener('window:resize')
  checkWidth() {
    if (!this.screenService.isDeviceLarge) {
      this.sideNavService.toggleLeft$.next(false);
      this.sideNavService.toggleRight$.next(false);
    }

    if (!this.screenService.isDeviceLarge && this.screenService.isDeviceMid) {
      this.sideNavService.toggleRight$.next(false);
    }
  }

}
