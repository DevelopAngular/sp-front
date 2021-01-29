import {AfterViewInit, Component, HostListener, NgZone, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ScreenService} from '../services/screen.service';
import {SideNavService} from '../services/side-nav.service';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {LiveDataService} from '../live-data/live-data.service';
import {Request} from '../models/Request';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NavigationEnd, Router} from '@angular/router';
import {filter as _filter} from 'lodash';
import {HttpService} from '../services/http-service';

declare const window;

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit, AfterViewInit, OnDestroy {

  public topPadding = '0px';

  inboxHasItems: Observable<boolean> = of(null);
  currentRequest$ = new BehaviorSubject<Request>(null);
  toggleLeft: Observable<boolean> = new Observable<boolean>();
  toggleRight: Observable<boolean> = new Observable<boolean>();
  sentRequests: any;
  receivedRequests: any;
  isStaff: boolean;
  data: any;
  navbarHeight: string = '78px';
  restriction$: Observable<boolean>;

  private destroy$: Subject<any> = new Subject<any>();

  @HostListener('window:resize')
  checkWidth() {
    if (!this.screenService.isDeviceLargeExtra) {
      this.sideNavService.toggleLeft$.next(false);
      this.sideNavService.toggleRight$.next(false);
    }

    if (!this.screenService.isDeviceLargeExtra && this.screenService.isDeviceMid) {
      this.sideNavService.toggleRight$.next(false);
    }

    this.navbarHeight = this.currentNavbarHeight;
  }

  constructor(
    public userService: UserService,
    public darkTheme: DarkThemeSwitch,
    private createFormService: CreateFormService,
    public screenService: ScreenService,
    private sideNavService: SideNavService,
    private dataService: DataService,
    private loadingService: LoadingService,
    private liveDataService: LiveDataService,
    private _zone: NgZone,
    private router: Router,
    private http: HttpService
  ) {

    this.http.schoolsCollection$
      .pipe(
        takeUntil(this.destroy$),
        map(schools => _filter(schools, (school => school.my_roles.length > 0)))
      )
      .subscribe((schools) => {
        this.topPadding = schools.length > 1 ? '50px' : '0px';
      });
    this.restriction$ = this.userService.blockUserPage$;

    const dbUser$ = combineLatest(
      this.userService.effectiveUser.asObservable(),
      this.dataService.currentUser
    ).pipe(
      map(([effectUser, currentUser]) => {
        // count += 1;
        // console.log('USER ==>>', count);
        if (effectUser) {
          return effectUser.user;
        } else {
          return currentUser;
        }
      }), take(1));

    dbUser$
      .pipe(
        filter(user => !!user),
        take(1),
        takeUntil(this.destroy$),
        tap(user => {
          this.liveDataService.getPassLikeCollectionRequest(user);
          this.liveDataService.getActivePassesRequest(of({sort: '-created', search_query: ''}), user);
          this.liveDataService.getHallMonitorPassesRequest(of({sort: '-created', search_query: ''}));
          this.isStaff = user.isTeacher() || user.isAdmin() || user.isAssistant();
          if (user.roles.includes('hallpass_student')) {
            this.receivedRequests = this.liveDataService.invitations$;
            this.sentRequests = this.liveDataService.requests$;
          } else {
            this.receivedRequests = this.liveDataService.requests$;
            this.sentRequests = this.liveDataService.invitations$;
          }
        }),
        switchMap(user => {
          return user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : of(null);
        })
      )
      .subscribe(passLike => {
        this._zone.run(() => {
          this.currentRequest$.next((passLike instanceof Request) ? passLike : null);
        });
      });
  }

  get titleColor () {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});
  }

  get currentNavbarHeight() {
    return this.router.url === '/main/hallmonitor' && this.screenService.isDeviceLargeExtra ||
    this.router.url === '/main/myroom' && this.screenService.isDeviceLargeExtra ? '0px' : '78px' ;
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

  ngOnInit() {
    this.toggleLeft = this.sideNavService.toggleLeft;
    this.toggleRight = this.sideNavService.toggleRight;

    this.toggleLeft.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        document.documentElement.style.position = 'fixed';
      } else {
        document.documentElement.style.position = 'static';

      }
    });

    this.userService.userData
      .pipe(
        filter(user => !user.isTeacher() && user.isAdmin()),
        takeUntil(this.destroy$)
      ).subscribe(user => {
        window.waitForAppLoaded();
        this.goHome(user);
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

    this.navbarHeight = this.currentNavbarHeight;

    this.router.events.subscribe( event => {
        if ( event instanceof NavigationEnd) {
          this.navbarHeight = this.currentNavbarHeight;
        }
    });
  }

  ngAfterViewInit(): void {
    window.appLoaded(1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  shouldShowRouter() {
    // return this.userService.userData.pipe(map(u => u.isStudent() || u.isTeacher() || u.isAssistant()));
  }

  onSwipe(event) {
  }

  goHome(user) {
    const availableAccessTo = user.roles.filter((_role) => _role.match('admin_'));
    let tab;
    if (availableAccessTo.includes('admin_dashboard')) {
      tab = 'dasboard';
    } else if (availableAccessTo.includes('admin_hallmonitor')) {
      tab = 'hallmonitor';
    } else if (availableAccessTo.includes('admin_search')) {
      tab = 'search';
    } else if (availableAccessTo.includes('admin_pass_config')) {
      tab = 'passconfig';
    } else if (availableAccessTo.includes('admin_accounts')) {
      tab = 'accounts';
    }
    this.router.navigate(['/admin', tab]);
    return;
  }

  onSettingClick($event) {
    if (this.screenService.isDeviceLargeExtra) {
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

}
