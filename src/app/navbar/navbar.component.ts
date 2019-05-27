import {Component, NgZone, OnInit, Input, ElementRef} from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import {ReplaySubject, combineLatest, of, Subject} from 'rxjs';
import {filter, switchMap, tap} from 'rxjs/operators';

import { DataService } from '../services/data-service';
import { GoogleLoginService } from '../services/google-login.service';
import { LoadingService } from '../services/loading.service';
import { NavbarDataService } from '../main/navbar-data.service';
import { User } from '../models/User';
import { NgProgress } from '@ngx-progressbar/core';
import { UserService } from '../services/user.service';
import { SettingsComponent } from '../settings/settings.component';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { NotificationFormComponent } from '../notification-form/notification-form.component';
import { LocationsService } from '../services/locations.service';
import * as _ from 'lodash';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NotificationService} from '../services/notification-service';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {HttpService} from '../services/http-service';
import {IntroDialogComponent} from '../intro-dialog/intro-dialog.component';

declare const window;

export interface RepresentedUser {
  user: User;
  roles: string[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  @Input() hasNav = true;
  // private representedUsers$: ReplaySubject<User> = new ReplaySubject(1);

  isStaff: boolean;
  showSwitchButton: boolean = false;
  user: User;
  representedUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;
  isProcess$ = this.process.ref().state;
  tab: string = 'passes';
  inboxVisibility: boolean = true;

  isOpenSettings: boolean;

  navbarEnabled = false;

  buttonHash = {
    passes: {title: 'Passes', route: 'passes', imgUrl: 'SP Arrow', requiredRoles: ['_profile_teacher', 'access_passes'], hidden: false},
    hallMonitor: {title: 'Hall Monitor', route: 'hallmonitor', imgUrl: 'Walking', requiredRoles: ['_profile_teacher', 'access_hall_monitor'], hidden: false},
    myRoom: {title: 'My Room', route: 'myroom', imgUrl: 'Room', requiredRoles: ['_profile_teacher', 'access_teacher_room'], hidden: true},
  };

  buttons = Object.values(this.buttonHash);

  fakeMenu: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
      private dataService: DataService,
      private userService: UserService,
      public dialog: MatDialog,
      public router: Router,
      private location: Location,
      public loadingService: LoadingService,
      public loginService: GoogleLoginService,
      private locationService: LocationsService,
      private _zone: NgZone,
      private navbarData: NavbarDataService,
      private process: NgProgress,
      private activeRoute: ActivatedRoute,
      public  notifService: NotificationService,
      public darkTheme: DarkThemeSwitch,
      private http: HttpService
  ) {

    const navbarEnabled$ = combineLatest(
      this.loadingService.isLoading$,
      this.loginService.isAuthenticated$,
      (a, b) => a && b);

    navbarEnabled$.subscribe(s => {
      this._zone.run(() => {
        this.navbarEnabled = s;
      });
    });
  }

  get optionsOpen() {
    return this.tab === 'settings';
  }

  get showNav() {
    return this.tab !== 'intro' && this.hasNav;
  }

  ngOnInit() {
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit[urlSplit.length - 1];

    this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd) {
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit[urlSplit.length - 1];
        this.tab = ((this.tab === '' || this.tab === 'main') ? 'passes' : this.tab);
        this.inboxVisibility = this.tab !== 'settings';
        this.dataService.updateInbox(this.inboxVisibility);
      }
    });

    this.userService.userData
      .pipe(
        this.loadingService.watchFirst
      )
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.isAdmin() || user.isTeacher();
          this.showSwitchButton = [user.isAdmin(), user.isTeacher(), user.isStudent()].filter(val => !!val).length > 1;
          this.dataService.updateInbox(this.tab !== 'settings');
        });
      });

    this.userService.effectiveUser
      .pipe(
        this.loadingService.watchFirst,
        filter(eu => !!eu),
        switchMap((eu: RepresentedUser) => {
          this.effectiveUser = eu;
          this.buttons.forEach((button) => {
            if (
              ((this.activeRoute.snapshot as any)._routerState.url === `/main/${button.route}`)
              &&
              !this.hasRoles(button.requiredRoles)
            ) {
              this.fakeMenu.next(true);
            }
          });
          return this.dataService.getLocationsWithTeacher(this.effectiveUser.user);
        })
      )
      .subscribe((locs): void => {
        if (!locs || (locs && !locs.length)) {
          this.buttonHash.myRoom.hidden = true;
        } else {
          this.buttonHash.myRoom.hidden = false;
        }
      })
    this.userService.representedUsers
      .pipe(
        this.loadingService.watchFirst
      )
      .subscribe((ru: RepresentedUser[]) => {
        this.representedUsers = ru;
      });

    this.userService.userData
      .pipe(
        filter(user => !user.isAssistant())
      )
      .subscribe(user => {
      this.buttons.forEach((button) => {
        if (
          ((this.activeRoute.snapshot as any)._routerState.url === `/main/${button.route}`)
          &&
          !this.hasRoles(button.requiredRoles)
        ) {
            this.fakeMenu.next(true);
          }
      });
    });
  }

  getIcon(iconName: string, darkFill?: string, lightFill?: string) {

    return this.darkTheme.getIcon({
      iconName: iconName,
      darkFill: darkFill,
      lightFill: lightFill,
    });
  }

  getColor(setting?, hover?: boolean, hoveredColor?: string) {

    return this.darkTheme.getColor({
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
    });
  }


  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  hasRoles(roles: string[]) {
    if (this.user.isAssistant()) {
      return roles.every((_role) => this.effectiveUser.roles.includes(_role));
    } else {
      return roles.every((_role) => this.user.roles.includes(_role));
    }
  }
  buttonVisibility(button) {
    return this.hasRoles(button.requiredRoles) && !button.hidden;
  }
  showOptions(event) {
    this.isOpenSettings = true;
    const target = new ElementRef(event.currentTarget);
    const settingRef = this.dialog.open(SettingsComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: { 'trigger': target, 'isSwitch': this.showSwitchButton }
    });

    settingRef.beforeClose().subscribe(() => {
        this.isOpenSettings = false;
    });

    settingRef.afterClosed().subscribe(action => {
      this.settingsAction(action);
    });
  }

  showTeaches(target) {
    const representedUsersDialog = this.dialog.open(DropdownComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target,
        'teachers': this.representedUsers,
        'selectedTeacher': this.effectiveUser,
        'user': this.user
      }
    });
    representedUsersDialog.afterClosed().subscribe((v: RepresentedUser) => {
      console.log(v);
      // this.effectiveUser = v ? v : this.effectiveUser;
      if (v) {
        this.userService.effectiveUser.next(v);
        this.http.effectiveUserId.next(+v.user.id);
      }
    });
  }

  settingsAction(action: string) {
      if (action === 'signout') {
        window.waitForAppLoaded();
        this.router.navigate(['sign-out']);
      } else if (action === 'favorite') {
          const favRef = this.dialog.open(FavoriteFormComponent, {
              panelClass: 'form-dialog-container',
              backdropClass: 'custom-backdrop',
          });

          favRef.afterClosed().pipe(switchMap(data => {
              const body = {'locations': data };
              return this.locationService.updateFavoriteLocations(body);
          })).subscribe();

      } else if (action === 'notifications') {
        let notifRef;
        if (NotificationService.hasSupport && NotificationService.canRequestPermission) {
            this.notifService.initNotifications(true)
              .then((hasPerm) => {
                console.log(`Has permission to show notifications: ${hasPerm}`);
                notifRef = this.dialog.open(NotificationFormComponent, {
                  panelClass: 'form-dialog-container',
                  backdropClass: 'custom-backdrop',
                });
              });

        } else {
          notifRef = this.dialog.open(NotificationFormComponent, {
            panelClass: 'form-dialog-container',
            backdropClass: 'custom-backdrop',
          });
        }
      } else if (action === 'intro') {
          // this.router.navigate(['main/intro']);
        this.dialog.open(IntroDialogComponent, {
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          panelClass: 'intro-dialog-container',
          backdropClass: 'intro-backdrop-container',
          data: {
            entry: true
          }
        });
      } else if (action === 'switch') {
          this.router.navigate(['admin']);
      } else if (action === 'team') {
          window.open('https://smartpass.app/team.html');
      } else if (action === 'about') {
          window.open('https://smartpass.app/about');
      } else if (action === 'support') {
          if (this.isStaff) {
              window.open('https://smartpass.app/support');
          } else {
              window.open('https://smartpass.app/studentdocs');
          }
      } else if (action === 'feedback') {
          window.location.href = 'mailto:feedback@smartpass.app';
      } else if (action === 'privacy') {
          window.open('https://www.smartpass.app/legal');
      }
  }

  openSupport(){
    window.open('https://smartpass.app/support');
  }

  getNavElementBg(index: number, type: string) {
    //return type == 'btn' ? (index == this.tabIndex ? 'rgba(165, 165, 165, 0.3)' : '') : (index == this.tabIndex ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 255, 255, 0)');
  }

  updateTab(route: string) {
    this.tab = route;
    if (this.tab === 'hallmonitor') {

    }
    console.log('[updateTab()]: ', this.tab);
    this.router.navigateByUrl('/main/' + this.tab);
  }

  inboxClick() {
    console.log('[Nav Inbox Toggle]', this.inboxVisibility);
    this.inboxVisibility = !this.inboxVisibility;
    this.dataService.updateInbox(this.inboxVisibility);
    if(this.tab!=='passes'){
      this.updateTab('passes');
    }
  }


}
