import {Component, OnInit, NgZone, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { DataService } from '../../services/data-service';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {SettingsComponent} from '../settings/settings.component';
import {map, pluck, switchMap, takeUntil} from 'rxjs/operators';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {KeyboardShortcutsService} from '../../services/keyboard-shortcuts.service';
import {SpAppearanceComponent} from '../../sp-appearance/sp-appearance.component';

declare const window;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  @ViewChild('settingsButton') settingsButton: ElementRef;
  @ViewChild('navButtonsContainter') navButtonsContainterRef: ElementRef;
  @ViewChild('tabRef') tabRef: ElementRef;

  @Output('restrictAccess') restrictAccess: EventEmitter<boolean> = new EventEmitter();

  // gettingStarted = {title: '', route : 'gettingstarted', type: 'routerLink', imgUrl : 'Lamp', requiredRoles: ['_profile_admin']};
  buttons = [
    {title: 'Get Started', route: 'gettingstarted', type: 'routerLink', imgUrl : 'Lamp', requiredRoles: ['_profile_admin']},
    {title: 'Dashboard', route : 'dashboard', type: 'routerLink', imgUrl : 'Dashboard', requiredRoles: ['_profile_admin', 'access_admin_dashboard']},
    {title: 'Hall Monitor', route : 'hallmonitor', type: 'routerLink', imgUrl : 'Walking', requiredRoles: ['_profile_admin', 'access_hall_monitor']},
    {title: 'Search', route : 'search', type: 'routerLink', imgUrl : 'SearchEye', requiredRoles: ['_profile_admin', 'access_admin_search']},
    {title: 'Rooms', route : 'passconfig', type: 'routerLink', imgUrl : 'Rooms', requiredRoles: ['_profile_admin', 'access_pass_config']},
    {title: 'Accounts', route : 'accounts', type: 'routerLink', imgUrl : 'Users', requiredRoles: ['_profile_admin', 'access_user_config']},
    {title: 'My School', route : 'myschool', type: 'routerLink', imgUrl : 'School', requiredRoles: ['_profile_admin', 'manage_school']}
  ];

  // progress = 0;

  fakeMenu = new BehaviorSubject<boolean>(false);
  tab: string[] = ['dashboard'];
  public pts: string;

  destroy$: Subject<any> = new Subject<any>();
    constructor(
        public router: Router,
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private userService: UserService,
        public loadingService: LoadingService,
        private dialog: MatDialog,
        private _zone: NgZone,
        public darkTheme: DarkThemeSwitch,
        public gsProgress: GettingStartedProgressService,
        private shortcutsService: KeyboardShortcutsService
    ) { }

  console = console;
    user: User;
  showButton: boolean;
  selectedSettings: boolean;

  get pointerTopSpace() {
    return this.pts;
  }

  ngOnInit() {
    this.gsProgress.onboardProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
      if (res.progress === 100 && this.buttons.find(button => button.title === 'Get Started')) {
        this.buttons.splice(0, 1);
      }
    });
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit.slice(1);
    this.tab = ( (this.tab === [''] || this.tab === ['admin']) ? ['dashboard'] : this.tab );
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
      if ( value instanceof NavigationEnd ) {
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit.slice(1);
        this.tab = ( (this.tab === [''] || this.tab === ['admin']) ? ['dashboard'] : this.tab );
      }
    });

    this.dataService.currentUser
      .pipe(
        this.loadingService.watchFirst,
        takeUntil(this.destroy$)
        )
      .subscribe(user => {

        this._zone.run(() => {
          this.user = user;
          this.showButton = user.roles.includes('_profile_admin') &&
                          ( user.roles.includes('_profile_teacher') ||
                            user.roles.includes('_profile_student') );
          this.dataService.updateInbox(!this.tab.includes('settings'));
        });
      });

    this.userService.userData
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
      this.buttons.forEach((button) => {
        if (
          ((this.activeRoute.snapshot as any)._routerState.url === `/admin/${button.route}`)
            &&
          !button.requiredRoles.every((_role) => user.roles.includes(_role))
      ) {
          this.restrictAccess.emit(true);
          this.fakeMenu.next(true);
        } else {
          this.restrictAccess.emit(false);
          this.fakeMenu.next(false);
        }
      });
    });

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        takeUntil(this.destroy$),
        pluck('key')
      ).subscribe(key => {
        if (key[0] === ',') {
          const settingButton = this.settingsButton.nativeElement.querySelector('.icon-button-container');
          (settingButton as HTMLElement).click();
        } else if (key[0] === '1' || key[0] === '2' || key[0] === '3' || key[0] === '4' || key[0] === '5' || key[0] === '6') {
          const route = {
            '1': 'dashboard',
            '2': 'hallmonitor',
            '3': 'search',
            '4': 'passconfig',
            '5': 'accounts',
            '6': 'myschool'
          };
          const currentButton = this.buttons.find(button => button.route === route[key[0]]);
          this.route(currentButton);
          if (!this.router.url.includes(currentButton.route)) {
            this.selectTab(this.tabRef.nativeElement, this.navButtonsContainterRef.nativeElement);
          }
        }
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

    if (!this.selectedSettings) {
      this.selectedSettings = true;
      const target = new ElementRef(event.currentTarget);
      UNANIMATED_CONTAINER.next(true);
      const settingsRef: MatDialogRef<SettingsComponent> = this.dialog.open(SettingsComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': target,
          'isSwitch': this.showButton,
          darkBackground: this.darkTheme.isEnabled$.value,
        }
      });

      settingsRef.beforeClose().subscribe(() => {
        this.selectedSettings = false;
      });

      settingsRef.afterClosed().subscribe(action => {
        UNANIMATED_CONTAINER.next(false);
        if (action === 'signout') {
          this.router.navigate(['sign-out']);
        } else if (action === 'switch') {
          this.router.navigate(['main']);
        } else if (action === 'getStarted') {
          this.router.navigate(['admin/gettingstarted']);
        } else if (action === 'about') {
          window.open('https://smartpass.app/about');
        } else if (action === 'appearance') {
          this.dialog.open(SpAppearanceComponent, {
            panelClass: 'form-dialog-container',
          });
        } else if (action === 'wishlist') {
          window.open('https://wishlist.smartpass.app');
        } else if (action === 'support') {
          window.open('https://www.smartpass.app/support');
        } else if (action === 'bug') {
          window.open('https://www.smartpass.app/bugreport');
        } else if (action === 'privacy') {
          window.open('https://www.smartpass.app/legal');
        }
      });
    }
  }

  selectTab(evt: HTMLElement, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = (evt as HTMLElement ).getBoundingClientRect();
    this.pts = Math.round(selectedTabRect.top - containerRect.top) + 'px';
  }

  isSelected(route: string) {
    return this.tab.includes(route);
  }
  hasRoles(roles: string[]): Observable<boolean> {

    return this.userService.userData
      .pipe(
        map(u => roles.every((_role) => u.roles.includes(_role)))
      );
  }
}
