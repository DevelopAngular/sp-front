import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import { GoogleLoginService } from './services/google-login.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {
    auditTime, debounceTime,
    delay,
    distinctUntilChanged,
    filter,
    last,
    map,
    mergeMap,
    publishLast, share,
    take,
    takeLast,
    takeUntil,
    throttleTime
} from 'rxjs/operators';
import {DeviceDetection} from './device-detection.helper';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpService} from './services/http-service';
import {School} from './models/School';
import {MatDialog} from '@angular/material';
import {UserService} from './services/user.service';
import {AdminService} from './services/admin.service';
import {ToastConnectionComponent} from './toast-connection/toast-connection.component';
import {WebConnectionService} from './services/web-connection.service';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  public isAuthenticated = false;
  public hideScroll: boolean = false;
  public hideSchoolToggleBar: boolean = false;
  public showUI: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public schools: School[] = [];
  // public schoolIdSubject: BehaviorSubject<School>;

  private subscriber$ = new Subject();

  constructor(
    public loginService: GoogleLoginService,
    private http: HttpService,
    private adminService: AdminService,
    private userService: UserService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private webConnection: WebConnectionService,
    private dialog: MatDialog,
  ) {
    // this.schoolIdSubject = this.http.schoolIdSubject;
  }

  ngOnInit() {
    if ( !DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS() ) {
      const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', './assets/css/custom_scrollbar.css');
            document.head.appendChild(link);
    }

    this.webConnection.checkConnection().pipe(takeUntil(this.subscriber$),
        filter(res => !res))
        .subscribe(() => {
            this.dialog.open(ToastConnectionComponent, {
              panelClass: 'toasr',
              backdropClass: 'invis-backgrop'
            });
    });

    this.loginService.isAuthenticated$.pipe(takeUntil(this.subscriber$))
        .subscribe(t => {

      // console.log('Auth response ===>', t);
      this._zone.run(() => {
        this.showUI.next(true);
        this.isAuthenticated = t;
      });
    });

    this.http.schools$.pipe(takeUntil(this.subscriber$))
        .subscribe(schools => {
      this.schools = schools;
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
          if (route.firstChild) { route = route.firstChild; }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        // console.log(data);
        if (data.signOut) {
          this.schools = [];
        }
        if (data.hideSchoolToggleBar) {
          this.hideSchoolToggleBar = true;
        } else {
          this.hideSchoolToggleBar = false;
        }
        this.hideScroll = data.hideScroll;
      });
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.matDialog.open(NextReleaseComponent, {
    //     panelClass: 'form-dialog-container'
    //   });
    // }, 1000);
  }


}
