import {Component, NgZone, OnInit, Input, ElementRef} from "@angular/core";
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  @Input() hasNav = true;

  isStaff: boolean;
  showSwitchButton: boolean = false;
  user: User;
  isProcess$ = this.process.ref().state;
  tab: string = 'passes';
  inboxVisibility: boolean = true;

  isOpenSettings: boolean;

  navbarEnabled = false;

  buttons = [
      {title: 'Passes', route: 'passes', imgUrl: './assets/Arrow', requiredRoles: ['_profile_teacher', '_profile_student']},
      {title: 'Hall Monitor', route: 'hallmonitor', imgUrl: './assets/Hallway', requiredRoles: ['_profile_teacher']},
      {title: 'My Room', route: 'myroom', imgUrl: './assets/My Room', requiredRoles: ['_profile_teacher']},
  ];

  currentUser;
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
      private activeRoute: ActivatedRoute
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

  get optionsOpen(){
    return this.tab==='settings';
  }

  get showNav(){
    return this.tab!=='intro' && this.hasNav;
  }

  ngOnInit() {
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit[urlSplit.length-1];

    this.router.events.subscribe(value => {
      if(value instanceof NavigationEnd){
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit[urlSplit.length-1];
        this.tab = ((this.tab==='' || this.tab==='main')?'passes':this.tab);
        this.inboxVisibility = this.tab!=='settings';
        this.dataService.updateInbox(this.inboxVisibility);
      }
    });

    // console.log('loading navbar');

    this.userService.userData
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          // console.log('User =>>>>>', user);
          this.isStaff = user.isAdmin() || user.isTeacher();
          this.showSwitchButton = [user.isAdmin(), user.isTeacher(), user.isStudent()].filter(val => !!val).length > 1;
          this.dataService.updateInbox(this.tab !== 'settings');
        });
      });
    this.dataService.getLocationsWithTeacher(this.user).subscribe(res => {
      _.remove(this.buttons, (el) => {
        return el.route === 'myroom' && !res.length;
      });
    });

    this.userService.userData.subscribe(user => {

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

  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  hasRoles(roles: string[]) {
     return roles.every((_role) => this.user.roles.includes(_role));
  }

  showOptions(event) {
    this.isOpenSettings = true;
    const target = new ElementRef(event.currentTarget);
    const settingRef = this.dialog.open(SettingsComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: { 'trigger': target }
    });

    settingRef.beforeClose().subscribe(() => {
        this.isOpenSettings = false;
    });

    settingRef.afterClosed().subscribe(action => {
      this.settingsAction(action);
    });
  }

  settingsAction(action: string) {
      if (action === 'signout') {
          this.router.navigate(['sign-out']);
      } else if (action === 'favorite') {
          const favRef = this.dialog.open(FavoriteFormComponent, {
              // width: '750px',
              // height: '365px',
              panelClass: 'form-dialog-container',
              backdropClass: 'custom-backdrop',
          });

          favRef.afterClosed().pipe(switchMap(data => {
              const body = {'locations': data };
              return this.locationService.updateFavoriteLocations(body);
          })).subscribe();

      } else if (action === 'notifications') {
          const notifRef = this.dialog.open(NotificationFormComponent, {
              panelClass: 'form-dialog-container',
              backdropClass: 'custom-backdrop',
          });
      } else if (action === 'intro') {
          this.router.navigate(['main/intro']);
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
