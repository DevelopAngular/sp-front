import {Component, OnInit, NgZone, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject ,  Observable } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { DataService } from '../../services/data-service';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { disableBodyScroll } from 'body-scroll-lock';
import {MatDialog, MatDialogRef} from '@angular/material';
import {SettingsComponent} from '../settings/settings.component';
import {map} from 'rxjs/operators';
import {DarkThemeSwitch} from '../../dark-theme-switch';

declare const window;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  @ViewChild('navMain') navMain: ElementRef;
  @ViewChild('navButtonsContainter') navButtonsContainterRef: ElementRef;
  @ViewChild('tabRef') tabRef: ElementRef;
  @Output('restrictAccess') restrictAccess: EventEmitter<boolean> = new EventEmitter();

  buttons = [
    {title: 'Dashboard', route : 'dashboard', type: 'routerLink', imgUrl : 'Dashboard', requiredRoles: ['_profile_admin', 'access_admin_dashboard']},
    {title: 'Hall Monitor', route : 'hallmonitor', type: 'routerLink', imgUrl : 'Walking', requiredRoles: ['_profile_admin', 'access_hall_monitor']},
    {title: 'Search', route : 'search', type: 'routerLink', imgUrl : 'SearchEye', requiredRoles: ['_profile_admin', 'access_admin_search']},
    {title: 'Rooms', route : 'passconfig', type: 'routerLink', imgUrl : 'Rooms', requiredRoles: ['_profile_admin', 'access_pass_config']},
    {title: 'Accounts', route : 'accounts', type: 'routerLink', imgUrl : 'Users', requiredRoles: ['_profile_admin', 'access_user_config']},
    {title: 'My School', route : 'myschool', type: 'routerLink', imgUrl : 'School', requiredRoles: ['_profile_admin']},
    // {title: 'Feedback', link : 'https://www.smartpass.app/feedback', type: 'staticButton', externalApp: 'mailto:feedback@smartpass.app', imgUrl : './assets/Feedback', requiredRoles: ['_profile_admin']},
    // {title: 'Support', link : 'https://www.smartpass.app/support', type: 'staticButton', imgUrl : './assets/Support', requiredRoles: ['_profile_admin']},
  ];
  fakeMenu = new BehaviorSubject<boolean>(false);
  tab: string[] = ['dashboard'];
  public pts: string;
    constructor(
        public router: Router,
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private userService: UserService,
        public loadingService: LoadingService,
        private dialog: MatDialog,
        private _zone: NgZone,
        public darkTheme: DarkThemeSwitch
    ) { }

  console = console;
    user: User;

  showButton: boolean;
  selectedSettings: boolean;

  get settingsIcon () {
    return `./assets/Settings (${this.darkTheme.isEnabled$.value ? 'White' : 'Blue-Gray'}).svg`;
  }
  get pointerTopSpace() {
    return this.pts;
  }

  ngOnInit() {

    disableBodyScroll(this.navMain.nativeElement);

    // setTimeout(() => {
    //   this.tabRef.nativeElement.click();
    // } , 250);

    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit.slice(1);
    if (this.isSelected('takeTour')) {
      this.pts = '-63px';
    }

    this.router.events.subscribe(value => {
      if ( value instanceof NavigationEnd ) {
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit.slice(1);
        // console.log(this.tab, value.url);
        this.tab = ( (this.tab === [''] || this.tab === ['admin']) ? ['dashboard'] : this.tab );
        // this.selectTab(this.tabRef.nativeElement, this.navButtonsContainterRef.nativeElement);
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
          !button.requiredRoles.every((_role) => user.roles.includes(_role))
      ) {
          console.log(button);
          console.log(button.requiredRoles.every((_role) => user.roles.includes(_role)));
          // debugger;
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
    console.log(event);
    this.selectedSettings = true;
    // return;

    const target = new ElementRef(event.currentTarget);
    const settingsRef: MatDialogRef<SettingsComponent> = this.dialog.open(SettingsComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target,
        'isSwitch': this.showButton,
        darkBackground: this.darkTheme.isEnabled$.value,
        'possition': {
          x: event.clientX,
          y: event.clientY
        }
      }
    });

    settingsRef.beforeClose().subscribe(() => {
      this.selectedSettings = false;
    });

    settingsRef.afterClosed().subscribe(action => {
        if (action === 'signout') {
          window.waitForAppLoaded();
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

  // tourRedirect() {
  //   this.router.navigate(['admin/takeTour']);
  // }

  selectTab(evt: HTMLElement, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = (evt as HTMLElement ).getBoundingClientRect();
    this.pts = Math.round(selectedTabRect.top - containerRect.top) + 'px';
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
    return this.userService.userData
      .pipe(
        map(u => roles.every((_role) => u.roles.includes(_role)))
      );
  }
}
