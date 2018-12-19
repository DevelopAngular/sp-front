import { Component, NgZone, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';

import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../data-service';
import { GoogleLoginService } from '../google-login.service';
import { LoadingService } from '../loading.service';
import { NavbarDataService } from '../main/navbar-data.service';
import { User } from '../models/User';
import { NgProgress } from '@ngx-progressbar/core';
import {ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  @Input() hasNav = true;

  isStaff: boolean;
  user: User;
  isProcess$ = this.process.ref().state;
  tab: string = 'passes';
  inboxVisibility: boolean = true;

  navbarEnabled = false;

  buttons = [
      {title: 'Passes', route: 'passes', imgUrl: './assets/Arrow', requiredRoles: ['_profile_teacher']},
      {title: 'Hall Monitor', route: 'hallmonitor', imgUrl: './assets/Hallway', requiredRoles: ['_profile_teacher']},
      {title: 'My Room', route: 'myroom', imgUrl: './assets/My Room', requiredRoles: ['_profile_teacher']},
  ];

  currentUser;
  fakeMenu: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
      private dataService: DataService,
      public dialog: MatDialog,
      public router: Router,
      private location: Location,
      public loadingService: LoadingService,
      public loginService: GoogleLoginService,
      private _zone: NgZone,
      private navbarData: NavbarDataService,
      private process: NgProgress,
      private activeRoute: ActivatedRoute
  ) {

    const navbarEnabled$ = Observable.combineLatest(
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

    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
          this.dataService.updateInbox(this.tab!=='settings');
        });
      });

    this.activeRoute.data.subscribe(_resolved => {
        this.currentUser =_resolved.currentUser;
        console.log('CurrentRoute ===> \n', (this.activeRoute.snapshot as any)._routerState.url, !this.hasRoles(this.buttons[0].requiredRoles));

        this.buttons.forEach((button) => {

            if (
                ((this.activeRoute.snapshot as any)._routerState.url == `/main/${button.route}`)
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

  showOptions() {
    if(this.optionsOpen){
      this.updateTab('passes');
    } else{
      this.updateTab('settings');
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
