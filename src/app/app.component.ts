import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import * as _ from 'lodash';
import { BehaviorSubject, interval, ReplaySubject, Subject } from 'rxjs';

import { filter, map, mergeMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { BUILD_INFO_REAL } from '../build-info';
import { DarkThemeSwitch } from './dark-theme-switch';

import { DeviceDetection } from './device-detection.helper';
import { School } from './models/School';
import { AdminService } from './services/admin.service';
import { GoogleLoginService } from './services/google-login.service';
import { HttpService, SPError } from './services/http-service';
import { KioskModeService } from './services/kiosk-mode.service';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';
import { WebConnectionService } from './services/web-connection.service';
import { ToastConnectionComponent } from './toast-connection/toast-connection.component';

declare const window;

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  schoolSignUp: boolean;

  public isAuthenticated = null;
  public hideScroll: boolean = false;
  public hideSchoolToggleBar: boolean = false;
  public showUISubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showUI = this.showUISubject.asObservable();
  public showError: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);
  public errorToastTrigger: ReplaySubject<SPError>;
  public schools: School[] = [];
  public darkThemeEnabled: boolean;
  private openedResizeDialog: boolean;
  private openConnectionDialog: boolean;

  private subscriber$ = new Subject();

  // @HostListener('window:resize', ['$event.target'])
  // onResize(target) {
  //     if ((target.innerWidth < 900 || target.innerHeight < 500) && !this.openedResizeDialog) {
  //       this.openedResizeDialog = true;
  //       setTimeout(() => {
  //           this.dialog.open(ResizeInfoDialogComponent, {
  //               id: 'ResizeDialog',
  //               panelClass: 'toasr',
  //               backdropClass: 'white-backdrop',
  //               disableClose: true
  //           });
  //       }, 50);
  //     } else if ((target.innerWidth >= 900 && target.innerHeight >= 500) && this.openedResizeDialog) {
  //         this.openedResizeDialog = false;
  //         this.dialog.getDialogById('ResizeDialog').close();
  //     }
  // }

  constructor(
    public darkTheme: DarkThemeSwitch,
    public loginService: GoogleLoginService,
    private http: HttpService,
    private httpNative: HttpClient,
    private adminService: AdminService,
    private userService: UserService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private webConnection: WebConnectionService,
    private dialog: MatDialog,
    private storageService: StorageService,
    private kms: KioskModeService
  ) {
    this.errorToastTrigger = this.http.errorToast$;
  }

  ngOnInit() {

    this.storageService.detectChanges();
    this.darkTheme.isEnabled$.subscribe((val) => {
      this.darkThemeEnabled = val;
    });

    if (!DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS()) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', './assets/css/custom_scrollbar.css');
      document.head.appendChild(link);
    }

    this.webConnection.checkConnection().pipe(takeUntil(this.subscriber$),
      filter(res => !res && !this.openConnectionDialog))
      .subscribe(() => {
        const toastDialog = this.dialog.open(ToastConnectionComponent, {
          panelClass: 'toasr',
          backdropClass: 'white-backdrop',
          disableClose: true
        });

        toastDialog.afterOpened().subscribe(() => {
          this.openConnectionDialog = true;
        });

        toastDialog.afterClosed().subscribe(() => {
          this.openConnectionDialog = false;
        });
      });

    this.loginService.isAuthenticated$.pipe(
      takeUntil(this.subscriber$),
    )
    .subscribe(t => {
      console.log('Auth response ===>', t);
      // debugger
      this._zone.run(() => {
        this.showUISubject.next(true);
        this.isAuthenticated = t;
        if (!t) {
          this.router.navigate(['']);
        }
      });
    });

    this.http.schools$.pipe(
      map(schools => _.filter(schools, (school => school.my_roles.length > 0))),
      withLatestFrom(this.http.currentSchool$),
      takeUntil(this.subscriber$))
      .subscribe(([schools, currentSchool]) => {
        this.schools = schools;
        if (currentSchool && !_.find(schools, {id: currentSchool.id})) {
          this.http.setSchool(schools[0]);
        }
      });

    // ============== SPA-407 ====================> Needs to be uncommented when the backend logic will completed
    // this.userService
    //   .getUserWithTimeout()
    //   .subscribe((user) => {
    //     this.matDialog.open(NextReleaseComponent, {
    //       panelClass: 'form-dialog-container',
    //       data: {
    //         'isTeacher': user.isTeacher(),
    //         'isStudent': user.isStudent()
    //       }
    //     });
    //   });
    // ============== SPA-407 ===================> End

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
          if (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {

        // console.log(data);
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
          // if (!window.user) {
          //   window.user = Object.freeze({
          //     id: data.currentUser.id,
          //     email: data.currentUser.primary_email,
          //     firstName: data.currentUser.first_name,
          //     lastName: data.currentUser.last_name
          //   });
          // }
          this.hubSpotSettings(data.currentUser);
        }

        if (data.hubspot && (data.authFree || (!data.currentUser.isStudent() && !this.http.kioskTokenSubject$.value && !this.kms.currentRoom$.value))) {
          if (!existingHub) {
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
            (existingHub as HTMLElement).setAttribute('style', 'display: block !important;width: 276px;height: 234px');
          }
        } else {
          if (existingHub) {
            (existingHub as HTMLElement).setAttribute('style', 'display: none !important');
          }
        }


        if (data.hideSchoolToggleBar) {
          this.hideSchoolToggleBar = true;
        } else {
          this.hideSchoolToggleBar = false;
        }
        this.hideScroll = data.hideScroll;
      });
  }

  hubSpotSettings(user) {
    const _hsq = window._hsq = window._hsq || [];

    const myPush = function (a) {
      if (!BUILD_INFO_REAL) {
        console.log('Pushed:', a);
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
  }


}
