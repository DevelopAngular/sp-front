import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter as _filter, find} from 'lodash';
import {BehaviorSubject, interval, Observable, ReplaySubject, Subject, zip} from 'rxjs';

import {filter, map, mergeMap, switchMap, take, takeUntil, withLatestFrom} from 'rxjs/operators';
import {BUILD_INFO_REAL} from '../build-info';
import {DarkThemeSwitch} from './dark-theme-switch';

import {DeviceDetection} from './device-detection.helper';
import {School} from './models/School';
import {AdminService} from './services/admin.service';
import {GoogleLoginService} from './services/google-login.service';
import {HttpService, SPError} from './services/http-service';
import {KioskModeService} from './services/kiosk-mode.service';
import {StorageService} from './services/storage.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import {APPLY_ANIMATED_CONTAINER, ConsentMenuOverlay} from './consent-menu-overlay';
import {Meta} from '@angular/platform-browser';
import {NotificationService} from './services/notification-service';
import {GoogleAnalyticsService} from './services/google-analytics.service';
import {ShortcutInput} from 'ng-keyboard-shortcuts';
import {KeyboardShortcutsService} from './services/keyboard-shortcuts.service';
import {NextReleaseComponent, Update} from './next-release/next-release.component';
import {User} from './models/User';
import {UserService} from './services/user.service';
import {NextReleaseService} from './next-release/services/next-release.service';
import {ScreenService} from './services/screen.service';
import {ToastService} from './services/toast.service';
import _refiner from 'refiner-js';

declare const window;

export const INITIAL_LOCATION_PATHNAME =  new ReplaySubject<string>(1);


/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  shortcuts: ShortcutInput[];

  private dialogContainer: HTMLElement;
  @ViewChild('dialogContainer', { static: true }) set content(content: ElementRef) {
    this.dialogContainer = content.nativeElement;
  }

  public isAuthenticated = null;
  public hideScroll: boolean = true;
  public hideSchoolToggleBar: boolean = false;
  public showUISubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showUI: Observable<boolean> = this.showUISubject.asObservable();
  public errorToastTrigger: ReplaySubject<SPError>;
  public schools: School[] = [];
  public darkThemeEnabled: boolean;
  public isKioskMode: boolean;
  public showSupportButton: boolean;
  public customToastOpen$: Observable<boolean>;
  public toasts$: Observable<any>;
  public hasCustomBackdrop$: Observable<boolean>;
  public customBackdropStyle$: Observable<any>;
  public user$: Observable<User>;

  private subscriber$ = new Subject();

  @HostListener('window:popstate', ['$event'])
  back(event) {
    if (DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) {
      window.history.pushState({}, '');
    }
  }

  constructor(
    public darkTheme: DarkThemeSwitch,
    public loginService: GoogleLoginService,
    private userService: UserService,
    private nextReleaseService: NextReleaseService,
    private http: HttpService,
    private httpNative: HttpClient,
    private adminService: AdminService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private overlayContainer: OverlayContainer,
    private storageService: StorageService,
    private kms: KioskModeService,
    private meta: Meta,
    private notifService: NotificationService,
    private googleAnalytics: GoogleAnalyticsService,
    private shortcutsService: KeyboardShortcutsService,
    private screen: ScreenService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.customToastOpen$ = this.toastService.isOpen$;
    this.toasts$ = this.toastService.toasts$;
    this.user$ = this.userService.user$.pipe(map(user => User.fromJSON(user)));
    this.hasCustomBackdrop$ = this.screen.customBackdropEvent$.asObservable();
    this.customBackdropStyle$ = this.screen.customBackdropStyle$;
    this.router.events.pipe(filter(() => DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile())).subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.history.pushState({}, '');
      }
    });

    this.userService.loadedUser$
      .pipe(
        filter(l => l),
        switchMap(l => this.userService.user$.pipe(take(1))),
        filter(user => !!user),
        switchMap((user: User) => {
          if (User.fromJSON(user).isAdmin() || User.fromJSON(user).isTeacher()) {
            this.registerRefiner(User.fromJSON(user));
          }
          return this.nextReleaseService
            .getLastReleasedUpdates(DeviceDetection.platform())
            .pipe(
              map((release: Array<Update>): Array<Update> => {
                return release.filter((update) => {
                  const allowUpdate: boolean = !!update.groups.find((group) => {
                    return user.roles.includes(`_profile_${group}`);
                  });
                  return allowUpdate;
                });
              })
            );
        }),
        filter((release: Array<Update>) => !!release.length),
        switchMap((release) => {
          let config;
          if (DeviceDetection.isMobile()) {
            config = {
              panelClass: 'main-form-dialog-container-mobile',
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              data: {
                isStudent: false,
                isTeacher: true,
                releaseUpdates: release
              }
            };
          } else {
            config = {
              panelClass: 'main-form-dialog-container',
              width: '425px',
              maxHeight: '450px',
              data: {
                isStudent: false,
                isTeacher: true,
                releaseUpdates: release
              }
            };
          }
          const dialogRef = this.dialog.open(NextReleaseComponent, config);
          return dialogRef.afterClosed().pipe(
            switchMap(() => zip(
              ...release.map((update: Update) => this.nextReleaseService.dismissUpdate(update.id, DeviceDetection.platform()))
            ))
          );
        })
      )
      .subscribe(console.log);

    this.shortcutsService.initialize();
    this.shortcuts = this.shortcutsService.shortcuts;

    // this.googleAnalytics.init();
    const fcm_sw = localStorage.getItem('fcm_sw_registered');
    if (fcm_sw === 'true') {
      this.notifService.initNotifications(true);
    }

    INITIAL_LOCATION_PATHNAME.next(window.location.pathname);

    this.darkTheme.isEnabled$.subscribe((val) => {
      this.darkThemeEnabled = val;
      document.documentElement.style.background = val ? '#0F171E' : '#FBFEFF';
      document.body.style.boxShadow = `0px 0px 100px 100px ${val ? '#0F171E' : '#FBFEFF'}`;
    });

    if (!DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS()) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', './assets/css/custom_scrollbar.css');
      document.head.appendChild(link);
    }

    // this.webConnection.checkConnection().pipe(takeUntil(this.subscriber$),
    //   filter(res => !res && !this.openConnectionDialog))
    //   .subscribe(() => {
    //     this.openConnectionDialog = true;
    //     const toastDialog = this.dialog.open(ToastConnectionComponent, {
    //       panelClass: 'toasr',
    //       hasBackdrop: false,
    //       disableClose: true
    //     });
    //
    //     toastDialog.afterClosed().subscribe(() => {
    //       this.openConnectionDialog = false;
    //     });
    //   });

    this.loginService.isAuthenticated$.pipe(
      takeUntil(this.subscriber$),
    )
    .subscribe(t => {
      this._zone.run(() => {
        this.showUISubject.next(true);
        this.isAuthenticated = t;
        const path = window.location.pathname;
        if (!t && (path.includes('admin') ||  path.includes('main'))) {
          this.router.navigate(['/']);
        }
      });
    });

    this.http.schoolsCollection$.pipe(
      map(schools => _filter(schools, (school => school.my_roles.length > 0))),
      withLatestFrom(this.http.currentSchool$),
      takeUntil(this.subscriber$))
      .subscribe(([schools, currentSchool]) => {
        this.schools = schools;
        if (currentSchool && !find(schools, {id: currentSchool.id})) {
          this.http.setSchool(schools[0]);
        }
      });

    this.http.currentSchool$.pipe(takeUntil(this.subscriber$))
      .subscribe((value => {
        if (!value) {
          this.schools = [];
        }
      }));
    this.router.events
      .pipe(
        takeUntil(this.subscriber$),
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          this.isKioskMode = this.router.url.includes('kioskMode');
          if (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        const existingHub: any = document.querySelector('#hubspot-messages-iframe-container');
        let newHub: any;

        if (!existingHub) {
          newHub = document.createElement('script');
          newHub.type = 'text/javascript';
          newHub.id = 'hs-script-loader';
          newHub.setAttribute('id', 'hs-script-loader');
          newHub.src = '//js.hs-scripts.com/5943240.js';
        }

        if (data.currentUser) {
          this.hubSpotSettings(data.currentUser);
        }

        if (data.hubspot &&
          ((data.currentUser && !data.currentUser.isStudent()) &&
            data.authFree || (!this.http.kioskTokenSubject$.value && !this.kms.currentRoom$.value)) && !this.screen.isDeviceLargeExtra
        ) {
          if (!existingHub) {
            this.showSupportButton = true;
            document.body.appendChild(newHub);
            const dst = new Subject<any>();
            interval(100)
              .pipe(
                takeUntil(dst)
              ).subscribe(() => {
              if (window._hsq) {
                dst.next();
                dst.complete();
              }
            });
          } else {
            (existingHub as HTMLElement).setAttribute('style', 'display: block !important;width: 100px;height: 100px');
          }
        } else {
          if (existingHub) {
            (existingHub as HTMLElement).setAttribute('style', 'display: none !important');
          }
        }

        this.hideSchoolToggleBar = data.hideSchoolToggleBar;
        this.hideScroll = data.hideScroll;
      });
  }

  registerRefiner(user) {
    _refiner('setProject', 'e832a600-7fe2-11ec-9b7a-cd5d0014e33d');
    _refiner('identifyUser', {
      id: user.id,
      email: user.primary_email,
      created: user.created,
      last_login: user.last_login,
      first_name: user.first_name,
      last_name: user.last_name,
      type: user.isAdmin() ? 'admin' : 'teacher',
      status: user.status,
      sync_types: user.sync_types,
      first_login: user.first_login,
      name: user.display_name,
      account: {
        id: this.http.getSchool().id, // <- School Id
        name: user.display_name
      }
    });
    // _refiner('showForm', '31b6c030-820a-11ec-9c99-8b41a98d875d');
  }

  hubSpotSettings(user) {
    const _hsq = window._hsq = window._hsq || [];

    const myPush = function (a) {
      if (!BUILD_INFO_REAL) {
        // console.log('Pushed:', a);
      }
      _hsq.push(a);
    };

    myPush(['identify', {
      email: user.primary_email,
      firstname: user.first_name,
      lastname: user.last_name,
    }]);

    myPush(['setPath', '/admin/dashboard']);
    myPush(['trackPageView']);

  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  ngAfterViewInit() {
    APPLY_ANIMATED_CONTAINER
      .subscribe((v: boolean) => {
        if (v) {
          const zIndexForContainer = (this.dialog.openDialogs.length + 1) * 1000;
          this.dialogContainer.classList.add('unanimated-dialog-container');
          this.dialogContainer.style.zIndex = `${zIndexForContainer}`;
          (this.overlayContainer as ConsentMenuOverlay).setContainer(this.dialogContainer);
        } else {
          this.dialogContainer.style.zIndex = '-1';
          this.dialogContainer.classList.remove('unanimated-dialog-container');
          (this.overlayContainer as ConsentMenuOverlay).restoreContainer();
        }
      });
  }

}
