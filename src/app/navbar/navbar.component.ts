import {
  Component,
  NgZone,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  EventEmitter,
  Output,
  ViewChild,
  AfterContentInit,
  AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, OnDestroy, Renderer2
} from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import {Router, NavigationEnd, ActivatedRoute, NavigationStart} from '@angular/router';

import {ReplaySubject, combineLatest, of, Subject, Observable, BehaviorSubject} from 'rxjs';
import {filter, switchMap, takeUntil, tap} from 'rxjs/operators';

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
import {DarkThemeSwitch} from '../dark-theme-switch';
import {NotificationService} from '../services/notification-service';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {HttpService} from '../services/http-service';
import {IntroDialogComponent} from '../intro-dialog/intro-dialog.component';
import {ScreenService} from '../services/screen.service';
import {NavbarAnimations} from './navbar.animations';
import {StorageService} from '../services/storage.service';
import {KioskModeService} from '../services/kiosk-mode.service';
import {SideNavService} from '../services/side-nav.service';
import {NavButtonComponent} from '../nav-button/nav-button.component';
import {Schedule} from 'primeng/primeng';
import {School} from '../models/School';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {DeviceDetection} from '../device-detection.helper';

declare const window;

export interface RepresentedUser {
  user: User;
  roles: string[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    NavbarAnimations.inboxAppearance,
    NavbarAnimations.arrowAppearance
  ]
})

export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy {

  @Input() hasNav = true;
  @ViewChild('tabPointer') tabPointer: ElementRef;
  @ViewChild('navButtonsContainer') navButtonsContainer: ElementRef;
  @ViewChildren('tabRef') tabRefs: QueryList<ElementRef>;

  @ViewChild('navButtonsContainerMobile') navButtonsContainerMobile: ElementRef;
  @ViewChildren('tabRefMobile') tabRefsMobile: QueryList<ElementRef>;

  @Output() settingsClick: EventEmitter<any> = new EventEmitter<any>();

  private destroyer$ = new Subject<any>();

  isStaff: boolean;
  showSwitchButton: boolean = false;
  user: User;
  representedUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;
  isProcess$ = this.process.ref().state;
  tab: string = 'passes';
  inboxVisibility: boolean = JSON.parse(this.storage.getItem('showInbox'));

  isOpenSettings: boolean;

  hideButtons: boolean;

  navbarEnabled = false;

  islargeDeviceWidth: boolean;

  isHallMonitorRoute: boolean;

  isMyRoomRoute: boolean;

  schools: School[] = [];

  buttonHash = {
    passes: {title: 'Passes', route: 'passes', imgUrl: 'SP Arrow', requiredRoles: ['_profile_teacher', 'access_passes'], hidden: false},
    hallMonitor: {title: 'Hall Monitor', route: 'hallmonitor', imgUrl: 'Walking', requiredRoles: ['_profile_teacher', 'access_hall_monitor'], hidden: false},
    myRoom: {title: 'My Room', route: 'myroom', imgUrl: 'Room', requiredRoles: ['_profile_teacher', 'access_teacher_room'], hidden: true},
  };

  buttons = Object.values(this.buttonHash);

  fakeMenu: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  isInboxClicked: boolean;

  fadeClick: boolean;

  private pts;

  isAdminRoute: boolean;

  isShrinked: boolean;

  @HostListener('window:resize')
    checkDeviceWidth() {
        this.underlinePosition();
        this.islargeDeviceWidth = this.screenService.isDeviceLargeExtra;

        if (this.islargeDeviceWidth) {
            this.inboxVisibility = false;

        }

        if (this.screenService.isDesktopWidth) {
            this.inboxVisibility = true;
            this.navbarData.inboxClick$.next(false);
            this.isInboxClicked = false;
        }
        this.dataService.updateInbox(this.inboxVisibility);
    }

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
      private http: HttpService,
      private storage: StorageService,
      public kioskMode: KioskModeService,
      public screenService: ScreenService,
      private sideNavService: SideNavService,
      private cdr: ChangeDetectorRef,
      private rendered: Renderer2
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

  get pointerTopSpace() {
    return this.pts;
  }

  ngOnInit() {
    this.hideButtons = this.router.url.includes('kioskMode');
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit[urlSplit.length - 1];

    this.isHallMonitorRoute =  this.router.url === '/main/hallmonitor';
    this.isMyRoomRoute = this.router.url === '/main/myroom';
    this.isAdminRoute = this.router.url.includes('/admin');
    this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd) {
        this.hideButtons = this.router.url.includes('kioskMode');
        console.log('Hide ===>>', value.url);
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit[urlSplit.length - 1];
        this.tab = ((this.tab === '' || this.tab === 'main') ? 'passes' : this.tab);
        this.inboxVisibility = this.tab !== 'settings';
        this.dataService.updateInbox(this.inboxVisibility);
        this.isHallMonitorRoute = value.url  === '/main/hallmonitor';
        this.isMyRoomRoute = value.url === '/main/myroom';
        this.isAdminRoute = value.url.includes('/admin');
      }
    });

    this.userService.userData
      .pipe(
        this.loadingService.watchFirst
      )
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.isTeacher();
          this.showSwitchButton = [user.isAdmin(), user.isTeacher(), user.isStudent()].filter(val => !!val).length > 1;
        });
      });

    this.userService.effectiveUser
      .pipe(
        this.loadingService.watchFirst,
        // filter(eu => !!eu),
        switchMap((eu: RepresentedUser) => {
          if (eu) {
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
          } else {
            return this.dataService.getLocationsWithTeacher(this.user);
          }
        })
      )
      .subscribe((locs): void => {
        if (!locs || (locs && !locs.length)) {
          this.buttonHash.myRoom.hidden = true;
        } else {
          this.buttonHash.myRoom.hidden = false;
        }
      });

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


    this.sideNavService.sideNavAction
      .pipe(
        takeUntil(this.destroyer$)
      )
      .subscribe(action => {
        this.settingsAction(action);
      });

    this.islargeDeviceWidth = this.screenService.isDeviceLargeExtra;

    this.sideNavService.fadeClick.subscribe(click =>  this.fadeClick = click);

    this.http.schools$.subscribe(schools => {
        this.schools = schools;
    });
  }

  ngAfterViewInit(): void {
      this.underlinePosition();
  }

  underlinePosition() {
    if (this.screenService.isDesktopWidth) {
      setTimeout( () => {
        this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainer);
      });
    }

    if (this.screenService.isDeviceLargeExtra) {
      this.setCurrentUnderlinePos(this.tabRefsMobile, this.navButtonsContainerMobile);
    }
  }

  setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef) {
    if (this.isStaff && buttonsContainer && this.tabRefs) {
      setTimeout(() => {
        const tabRefsArray = refsArray.toArray();
        const selectedTabRef = this.buttons.findIndex((button) => button.route === this.tab);
        if (tabRefsArray[selectedTabRef]) {
          this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
        }
      }, 550);
    }
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

  selectTab(event: HTMLElement, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = event.getBoundingClientRect();
    const tabPointerHalfWidth = this.tabPointer.nativeElement.getBoundingClientRect().width / 2;

    if (this.screenService.isDeviceLargeExtra) {
      this.pts = (( event.offsetLeft + event.offsetWidth / 2) - tabPointerHalfWidth) + 'px';
    } else {
      this.pts = Math.round((selectedTabRect.left - containerRect.left) + tabPointerHalfWidth) + 'px';
    }

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
    if (this.screenService.isDeviceLargeExtra) {
      this.sideNavService.toggle$.next(true);
      this.sideNavService.toggleLeft$.next(true);
    }

    const target = new ElementRef(event.currentTarget);
    if (!this.screenService.isDeviceLargeExtra) {
      this.isOpenSettings = true;
      UNANIMATED_CONTAINER.next(true);
      const settingRef = this.dialog.open(SettingsComponent, {
        panelClass: ['calendar-dialog-container', 'animation'],
        backdropClass: 'invis-backdrop',
        data: { 'trigger': target, 'isSwitch': this.showSwitchButton }
      });

      settingRef.beforeClose().subscribe(() => {
        this.isOpenSettings = false;
      });

      settingRef.afterClosed().subscribe(action => {
        UNANIMATED_CONTAINER.next(false);
        this.settingsAction(action);
      });
    }

    this.settingsClick.emit({ 'trigger': target, 'isSwitch': this.showSwitchButton });

    this.sideNavService.sideNavData$.next({ 'trigger': target, 'isSwitch': this.showSwitchButton });

    this.sideNavService.sideNavType$.next('left');
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
        // window.waitForAppLoaded();
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

  updateTab(route: string) {
    this.tab = route;
    console.log('[updateTab()]: ', this.tab);
    this.router.navigateByUrl('/main/' + this.tab);
  }

  inboxClick() {
    this.inboxVisibility = !this.inboxVisibility;
    this.storage.setItem('showInbox', this.inboxVisibility);
    this.dataService.updateInbox(this.inboxVisibility);
    if(this.tab!=='passes'){
      this.updateTab('passes');
    }

    this.navbarData.inboxClick$.next(this.isInboxClicked = !this.isInboxClicked);

    if (this.screenService.isDeviceLarge && !this.screenService.isDeviceMid) {
      this.sideNavService.toggleRight$.next(true);
    }
  }

  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  shrinkTab(tab) {
      this.rendered.setStyle(tab, 'webkitTransform', 'scale(.86)');;
  }

  expandTab(tab) {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isSafari && iOS) {
      setTimeout( () => {
        this.rendered.setStyle(tab, 'webkitTransform', 'unset');
      }, 200);
    } else {
      this.rendered.setStyle(tab, 'webkitTransform', 'unset');
    }
  }
}
