import { AfterViewInit, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

import { DeviceDetection } from './device-detection.helper';
import { GoogleLoginService } from './services/google-login.service';
import { HttpService } from './services/http-service';
import { School } from './models/School';
import { MatDialog } from '@angular/material';
import { UserService } from './services/user.service';
import { AdminService } from './services/admin.service';
import { ToastConnectionComponent } from './toast-connection/toast-connection.component';
import { WebConnectionService } from './services/web-connection.service';
import { ResizeInfoDialogComponent } from './resize-info-dialog/resize-info-dialog.component';
import {StorageService} from './services/storage.service';
import {DarkThemeSwitch} from './dark-theme-switch';

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
  public darkThemeEnabled: boolean;
  private openedResizeDialog: boolean;

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
    private adminService: AdminService,
    private userService: UserService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private webConnection: WebConnectionService,
    private dialog: MatDialog,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {

    this.storageService.detectChanges();
    this.darkTheme.isEnabled$.subscribe((val) => {
      this.darkThemeEnabled = val;
    });

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
              backdropClass: 'white-backdrop',
              disableClose: true
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
