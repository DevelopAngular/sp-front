import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

import {combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {filter, map, pluck, switchMap, takeUntil} from 'rxjs/operators';

import {DataService} from '../services/data-service';
import {GoogleLoginService} from '../services/google-login.service';
import {LoadingService} from '../services/loading.service';
import {NavbarDataService} from '../main/navbar-data.service';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import {SettingsComponent} from '../settings/settings.component';
import {FavoriteFormComponent} from '../favorite-form/favorite-form.component';
import {NotificationFormComponent} from '../notification-form/notification-form.component';
import {LocationsService} from '../services/locations.service';
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
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {DeviceDetection} from '../device-detection.helper';
import {TeacherPinComponent} from '../teacher-pin/teacher-pin.component';
import {NavbarElementsRefsService} from '../services/navbar-elements-refs.service';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {filter as _filter} from 'lodash';
import {SpAppearanceComponent} from '../sp-appearance/sp-appearance.component';
import {MyProfileDialogComponent} from '../my-profile-dialog/my-profile-dialog.component';
import * as moment from 'moment';

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
  @ViewChild('navbar') navbar: ElementRef;
  @ViewChild('setButton') settingsButton: ElementRef;

  @ViewChild('navButtonsContainerMobile') navButtonsContainerMobile: ElementRef;
  @ViewChildren('tabRefMobile') tabRefsMobile: QueryList<ElementRef>;

  @Output() settingsClick: EventEmitter<any> = new EventEmitter<any>();

  private destroyer$ = new Subject<any>();

  isStaff: boolean;
  showSwitchButton: boolean = false;
  user: User;
  representedUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;
  tab: string = 'passes';
  inboxVisibility: boolean = JSON.parse(this.storage.getItem('showInbox'));
  introsData: any;

  isOpenSettings: boolean;

  hideButtons: boolean;

  navbarEnabled = false;

  islargeDeviceWidth: boolean;

  isHallMonitorRoute: boolean;

  isMyRoomRoute: boolean;

  countSchools$: Observable<number>;

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

  isAssistant: boolean;

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
      private activeRoute: ActivatedRoute,
      public  notifService: NotificationService,
      public darkTheme: DarkThemeSwitch,
      private http: HttpService,
      private storage: StorageService,
      public kioskMode: KioskModeService,
      public screenService: ScreenService,
      public sideNavService: SideNavService,
      private cdr: ChangeDetectorRef,
      private rendered: Renderer2,
      private navbarElementsService: NavbarElementsRefsService,
      private shortcutsService: KeyboardShortcutsService
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

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get isKioskMode() {
    return !!this.kioskMode.currentRoom$.value;
  }

  get isSafari() {
    return DeviceDetection.isSafari();
  }

  get flexDirection() {
    let direction = 'row';
    if  (this.screenService.isDeviceLargeExtra) direction = 'row-reverse';
    if  (this.isKioskMode && this.screenService.isDeviceLargeExtra) direction = 'row';
    return direction;
  }

  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  get showNotificationBadge() {
    return this.user && moment().add(7, 'days').isSameOrBefore(moment(this.user.created));
  }

  ngOnInit() {
    this.underlinePosition();
    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroyer$)
      )
      .subscribe(key => {
        if (key[0] === ',') {
          const settingButton = this.settingsButton.nativeElement.querySelector('.icon-button-container');
          (settingButton as HTMLElement).click();
        } else if (
          (key[0] === '1' || key[0] === '2' || key[0] === '3') &&
          !this.dialog.openDialogs || !this.dialog.openDialogs.length && key[0] !== 'r') {
          const route = {
            '1': 'passes',
            '2': 'hallmonitor',
            '3': 'myroom'
          };
          const currentButton = this.buttons.find(button => button.route === route[key[0]]);
          if (this.buttonVisibility(currentButton)) {
            this.updateTab(currentButton.route);
            this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainer, 0);
          }
        }
      });
    this.hideButtons = this.router.url.includes('kioskMode');
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit[urlSplit.length - 1];

    this.isHallMonitorRoute =  this.router.url === '/main/hallmonitor';
    this.isMyRoomRoute = this.router.url === '/main/myroom';
    this.isAdminRoute = this.router.url.includes('/admin');
    this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd) {
        this.hideButtons = this.router.url.includes('kioskMode');
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

    this.navbarData.inboxClick$.subscribe(res => {
      this.isInboxClicked = res;
    });

    this.userService.userData
      .pipe(
        this.loadingService.watchFirst,
        takeUntil(this.destroyer$)
      )
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.isTeacher();
          this.isAssistant = user.isAssistant();
          this.showSwitchButton = [user.isAdmin(), user.isTeacher(), user.isStudent()].filter(val => !!val).length > 1;
        });
      });

    this.userService.effectiveUser
      .pipe(
        this.loadingService.watchFirst,
        takeUntil(this.destroyer$),
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

    this.countSchools$ = this.http.schoolsCollection$.pipe(
      map(schools => {
        const filteredSchools = _filter(schools, (school => school.my_roles.length > 0));
        return filteredSchools.length;
      })
    );

    this.userService.introsData$
      .pipe(
        filter(res => !!res),
        takeUntil(this.destroyer$)
      ).subscribe(data => {
        this.introsData = data;
    });
  }

  ngAfterViewInit(): void {
    this.underlinePosition();
    this.navbarElementsService.navbarRef$.next(this.navbar);
  }

  underlinePosition() {
    this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainer);
    if (this.screenService.isDesktopWidth) {
      setTimeout( () => {
        this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainer);
      }, 0);
    }

    if (this.screenService.isDeviceLargeExtra) {
      this.setCurrentUnderlinePos(this.tabRefsMobile, this.navButtonsContainerMobile);
    }
  }

  setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef, timeout: number = 550) {
    if (this.isStaff && buttonsContainer && this.tabRefs ||
      this.isAssistant && buttonsContainer && this.tabRefs) {
      setTimeout(() => {
        const tabRefsArray = refsArray.toArray();
        const selectedTabRef = this.buttons.findIndex((button) => button.route === this.tab);
        if (tabRefsArray[selectedTabRef]) {
          this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
        }
      }, timeout);
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
    const userRoles = roles.reduce((acc, curr, index) => {
      return {...acc, [curr]: index};
    }, {});
      return this.user.roles.find(role => userRoles[role]);
  }

  buttonVisibility(button) {
    return this.hasRoles(button.requiredRoles) && !button.hidden;
  }

  showOptions(event) {
    if (!this.isOpenSettings) {
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
      if (v) {
        this.userService.effectiveUser.next(v);
        this.http.effectiveUserId.next(+v.user.id);
      }
    });
  }

  settingsAction(action: string) {
      if (action === 'signout') {
        this.router.navigate(['sign-out']);
      } else if (action === 'myPin') {
        const teachPinDialog = this.dialog.open(TeacherPinComponent, {
          panelClass: 'sp-form-dialog',
          backdropClass: 'custom-backdrop',
        });
      } else if (action === 'profile') {
        this.dialog.open(MyProfileDialogComponent, {
          panelClass: 'sp-form-dialog',
          width: '425px',
          height: '500px'
        });
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

        if (!this.isSafari) {
          Notification.requestPermission();
        }

        let notifRef;
        if (NotificationService.hasSupport && NotificationService.canRequestPermission && !this.isSafari) {
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
      } else if (action === 'appearance') {
          this.dialog.open(SpAppearanceComponent, {
            panelClass: 'sp-form-dialog',
          });
      }  else if (action === 'switch') {
        this.router.navigate(['admin']);
      } else if (action === 'team') {
          window.open('https://smartpass.app/team.html');
      } else if (action === 'support') {
          if (this.isStaff) {
              window.open('https://smartpass.app/support');
          } else {
              window.open('https://smartpass.app/studentdocs');
          }
      } else if (action === 'bug') {
        window.open('https://www.smartpass.app/bugreport');
      } else if (action === 'wishlist') {
          window.open('https://wishlist.smartpass.app');
      } else if (action === 'privacy') {
        window.open('https://www.smartpass.app/privacy');
      } else if (action === 'terms') {
        window.open('https://www.smartpass.app/terms');
      } else if (action === 'refer') {
        if (this.introsData.referral_reminder.universal && !this.introsData.referral_reminder.universal.seen_version) {
          this.userService.updateIntrosRequest(this.introsData, 'universal', '1');
        }
        window.open('https://www.smartpass.app/referrals');
      }
  }

  updateTab(route: string) {
    this.tab = route;
    // console.log('[updateTab()]: ', this.tab);
    this.router.navigateByUrl('/main/' + this.tab);
  }

  inboxClick() {
    this.inboxVisibility = !this.inboxVisibility;
    this.storage.setItem('showInbox', this.inboxVisibility);
    this.dataService.updateInbox(this.inboxVisibility);
    if (this.tab !== 'passes') {
      this.updateTab('passes');
    }

    this.navbarData.inboxClick$.next(this.isInboxClicked = !this.isInboxClicked);

    if (this.screenService.isDeviceLarge && !this.screenService.isDeviceMid) {
      this.sideNavService.toggleRight$.next(true);
    }
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  changeTabOpacity(clickedTab: HTMLElement, pressed: boolean) {
    if (DeviceDetection.isIOSMobile() || DeviceDetection.isIOSMobile()) {
      this.rendered.setStyle(clickedTab, 'opacity', 0.8);
      setTimeout( () => {
        this.rendered.setStyle(clickedTab, 'opacity', 1);
      }, 200);
    } else {
      this.rendered.setStyle(clickedTab, 'opacity', pressed ? 0.8 : 1);
    }
  }
}
