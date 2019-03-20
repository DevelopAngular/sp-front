import {Component, OnInit, NgZone, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { DataService } from '../../services/data-service';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { disableBodyScroll } from 'body-scroll-lock';
import {MatDialog} from '@angular/material';
import {SettingsComponent} from '../settings/settings.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  @ViewChild('navMain') navMain: ElementRef;
  @Output('restrictAccess') restrictAccess: EventEmitter<boolean> = new EventEmitter();

  buttons = [
    {title: 'Dashboard', route : 'dashboard', type: 'routerLink', imgUrl : './assets/Dashboard', requiredRoles: ['_profile_admin', 'admin_dashboard']},
    {title: 'Hall Monitor', route : 'hallmonitor', type: 'routerLink', imgUrl : './assets/Hallway', requiredRoles: ['_profile_admin', 'admin_hall_monitor']},
    {title: 'Search', route : 'search', type: 'routerLink', imgUrl : './assets/Search', requiredRoles: ['_profile_admin', 'admin_search']},
    {title: 'Pass Configuration', route : 'passconfig', type: 'routerLink', imgUrl : './assets/Arrow', requiredRoles: ['_profile_admin', 'admin_pass_config']},
    {title: 'Accounts & Profiles', route : 'accounts', type: 'routerLink', imgUrl : './assets/Accounts', requiredRoles: ['_profile_admin', 'admin_accounts']},
    // {title: 'Feedback', link : 'https://www.smartpass.app/feedback', type: 'staticButton', externalApp: 'mailto:feedback@smartpass.app', imgUrl : './assets/Feedback', requiredRoles: ['_profile_admin']},
    // {title: 'Support', link : 'https://www.smartpass.app/support', type: 'staticButton', imgUrl : './assets/Support', requiredRoles: ['_profile_admin']},
  ];
  fakeMenu = new BehaviorSubject<boolean>(false);
  tab: string[] = ['dashboard'];

    constructor(
        public router: Router,
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private userService: UserService,
        public loadingService: LoadingService,
        private dialog: MatDialog,
        private _zone: NgZone
    ) { }

  console = console;
    user: User;

  showButton: boolean;
  selectedSettings: boolean;

  ngOnInit() {

    disableBodyScroll(this.navMain.nativeElement);

    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit.slice(1);

    this.router.events.subscribe(value => {
      if ( value instanceof NavigationEnd ) {
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit.slice(1);
        console.log(this.tab, value.url);
        this.tab = ( (this.tab === [''] || this.tab === ['admin']) ? ['dashboard'] : this.tab );
      }
    });

    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {

        this._zone.run(() => {
          this.user = user;
          this.showButton = user.roles.includes('_profile_admin') && ( user.roles.includes('_profile_teacher') || user.roles.includes('_profile_student') );
          this.dataService.updateInbox(!this.tab.includes('settings'));
        });
      });

    this.userService.userData.subscribe((user: any) => {
        // console.log('CurrentRoute ===> \n', (this.activeRoute.snapshot as any)._routerState.url, !this.hasRoles(this.buttons[0].requiredRoles));
      this.buttons.forEach((button) => {
        if (
          ((this.activeRoute.snapshot as any)._routerState.url === `/admin/${button.route}`)
            &&
          !this.hasRoles(button.requiredRoles)
        ) {
          this.restrictAccess.emit(true);
          this.fakeMenu.next(true);
        }
      });
    });
  }

  route( button: any) {
    switch (button.type) {
      case 'routerLink':
        this.tab = ['admin', button.route];
        this.router.navigate(this.tab);
        break;
      case 'staticButton':
        if (button.externalApp) {
          window.location.href = button.externalApp;
        } else {
          window.open(button.link);
        }
        break;
    }
  }

  openSettings(event) {
    this.selectedSettings = true;
    const target = new ElementRef(event.currentTarget);
    const settingsRef = this.dialog.open(SettingsComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: { 'trigger': target, 'isSwitch': this.showButton }
    });

    settingsRef.beforeClose().subscribe(() => {
      this.selectedSettings = false;
    });

    settingsRef.afterClosed().subscribe(action => {
        if (action === 'signout') {
            this.router.navigate(['sign-out']);
        } else if (action === 'switch') {
          this.router.navigate(['main']);
        } else if (action === 'about') {
            window.open('https://smartpass.app/about');
        } else if (action === 'feedback') {
            window.open('https://www.smartpass.app/feedback');
        } else if (action === 'support') {
            window.open('https://www.smartpass.app/support');
        } else if (action === 'privacy') {
          window.open('https://www.smartpass.app/legal');
        }
    });
  }

  isSelected(route: string) {
    return this.tab.includes(route);
  }
  hasRoles(roles: string[]): Observable<boolean> {
    // const mockRoles = [
    //  '_profile_admin',
    //  'admin_accounts',
    //  'admin_dashboard',
    //  'admin_hall_monitor',
    //  'admin_pass_config',
    //  'admin_search',
    //  'create_report',
    //  'edit_all_hallpass',
    //  'flag_hallpass',
    //  'manage_alerts',
    //  'manage_locations',
    //  'manage_pinnables',
    //  'manage_school',
    //  'view_reports',
    //  'view_traveling_users',
    // ]
    return this.userService.userData.map(u => roles.every((_role) => u.roles.includes(_role)));
  }
}
