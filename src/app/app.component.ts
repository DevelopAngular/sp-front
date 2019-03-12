import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { GoogleLoginService } from './services/google-login.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {delay, filter, map, mergeMap, timeout} from 'rxjs/operators';
import {DeviceDetection} from './device-detection.helper';
import {BehaviorSubject, empty, of} from 'rxjs';
import {HttpService} from './services/http-service';
import {School} from './models/School';
import {MatDialog} from '@angular/material';
import {NextReleaseComponent} from './next-release/next-release.component';
import {UserService} from './services/user.service';
import {StorageService} from './services/storage.service';
import {AdminService} from './services/admin.service';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {

  public isAuthenticated = false;
  public hideScroll: boolean = false;
  public hideSchoolToggleBar: boolean = false;
  public showUI: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public schools: School[] = [];
  // public schoolIdSubject: BehaviorSubject<School>;

  constructor(
    public loginService: GoogleLoginService,
    private http: HttpService,
    private adminService: AdminService,
    private userService: UserService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storage: StorageService
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

    this.loginService.isAuthenticated$.subscribe(t => {

      // console.log('Auth response ===>', t);
      this._zone.run(() => {
        this.showUI.next(true);
        this.isAuthenticated = t;
      });
    });

    this.http.schools$.subscribe(schools => {
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

    this.http.currentSchool$.subscribe((value => {
      if (!value) {
        this.schools = [];
      }
    }));
    this.router.events
      .pipe(
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
  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.matDialog.open(NextReleaseComponent, {
    //     panelClass: 'form-dialog-container'
    //   });
    // }, 1000);
  }

}
