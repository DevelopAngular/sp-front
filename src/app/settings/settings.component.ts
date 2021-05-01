import {Component, ElementRef, Inject, Input, NgZone, OnDestroy, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {User} from '../models/User';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {BUILD_DATE, RELEASE_NAME} from '../../build-info';
import {KioskModeService} from '../services/kiosk-mode.service';
import {SideNavService} from '../services/side-nav.service';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {combineLatest, Observable, Subject} from 'rxjs';
import {DeviceDetection} from '../device-detection.helper';
import {UserService} from '../services/user.service';
import {filter, takeUntil, withLatestFrom} from 'rxjs/operators';
import * as moment from 'moment';

export interface Setting {
  hidden: boolean;
  background: string;
  icon: string;
  action: string | Function;
  title: string;
  tooltip?: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class SettingsComponent implements OnInit, OnDestroy {

  @Input() dataSideNav: any = null;

  targetElementRef: ElementRef;
  settings: Setting[] = [];
  user: User;
  isStaff: boolean;
  intosData: any;

  isSwitch: boolean;

  hoveredMasterOption: boolean;
  hoveredSignout: boolean;
  hovered: boolean;
  pressed: boolean;
  hoveredColor: string;
  version = 'Version 1.5';
  currentRelease = RELEASE_NAME;
  currentBuildTime = BUILD_DATE;
  teacherPin$: Observable<string | number>;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      public dialog: MatDialog,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      @Optional() public dialogRef: MatDialogRef<SettingsComponent>,
      private dataService: DataService,
      private _zone: NgZone,
      private sideNavService: SideNavService,
      public loadingService: LoadingService,
      public darkTheme: DarkThemeSwitch,
      public kioskMode: KioskModeService,
      private router: Router,
      private pwaStorage: LocalStorage,
      private userService: UserService
  ) {
    // this.initializeSettings();
  }

  get isKioskMode(): boolean {
    return !!this.kioskMode.currentRoom$.value;
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get showNotificationBadge() {
    return this.user && moment(this.user.created).add(7, 'days').isSameOrBefore(moment());
  }

  ngOnInit() {
    this.teacherPin$ = this.userService.userPin$;
    this.userService.introsData$
      .pipe(withLatestFrom(this.userService.user$.pipe(filter(user => !!user))), takeUntil(this.destroy$))
      .subscribe(([intros, user]) => {
        this._zone.run(() => {
          this.user = User.fromJSON(user);
          this.intosData = intros;
          this.settings = [];
          this.isStaff = this.user.isTeacher() || this.user.isAssistant();
          this.initializeSettings();
        });
      });
    if (this.data) {
      this.targetElementRef = this.data['trigger'];
      this.isSwitch = this.data['isSwitch'] && !this.kioskMode.currentRoom$.value;
    }

    this.sideNavService.sideNavData.pipe(takeUntil(this.destroy$)).subscribe( sideNavData => {
      if (sideNavData) {
        this.targetElementRef = sideNavData['trigger'];
        // this.isSwitch = sideNavData['isSwitch'] && !this.kioskMode.currentRoom$.value;
        this.isSwitch = false;
      }
    });

    this.sideNavService.toggle.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.settings = [];
      this.initializeSettings();
    });

    this.updateDialogPosition();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIcon(iconName: string, setting: any) {
    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting
    });
  }

  getColor(dark, white) {
    return this.darkTheme.getColor({
      dark,
      white
    });
  }

  onHover(color) {
    this.hovered = true;
    this.hoveredColor = color;
  }

  handleAction(setting) {
    if (!this.dialogRef && typeof setting.action === 'string' ) {
      this.sideNavService.sideNavAction$.next(setting.action);
      this.sideNavService.toggle$.next(false);
    } else if (typeof setting.action === 'string' && this.dialogRef) {
      this.dialogRef.close(setting.action);
    } else {
      setting.action();
      this.sideNavService.toggle$.next(false);
    }
  }

  updateDialogPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    if (this.targetElementRef && this.dialogRef) {
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 168 }px`, top: `${rect.bottom + 10}px` };
      this.dialogRef.updatePosition(matDialogConfig.position);
    }
  }

  signOutAction() {
    if (this.dialogRef) {
        this.dialogRef.close('signout');
    } else {
        this.sideNavService.sideNavAction$.next('signout');
    }
    this.removeOfflineAuthData();
    localStorage.removeItem('fcm_sw_registered');
  }

  switchAction() {
    if (this.dialogRef) {
      this.dialogRef.close('switch');
    } else {
      this.router.navigate(['admin']);
      this.sideNavService.toggleLeft$.next(false);
      this.sideNavService.sideNavAction$.next('');
      this.sideNavService.fadeClick$.next(true);
    }
  }

  removeOfflineAuthData() {
    if (this.dialogRef) {
      this.dialogRef.close('signout');
    }

    combineLatest(
      this.pwaStorage.removeItem('servers'),
      this.pwaStorage.removeItem('authData'))
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  openLink(action) {
    if (action === 'privacy') {
      if (this.dialogRef) {
        this.dialogRef.close('privacy');
      } else {
        this.sideNavService.sideNavAction$.next('privacy');
      }
    } else if (action === 'terms') {
      if (this.dialogRef) {
        this.dialogRef.close('terms');
      } else {
        this.sideNavService.sideNavAction$.next('terms');
      }
    }
  }

  initializeSettings() {
    this.settings.push({
      'hidden': this.isKioskMode,
      'background': '#6651FF',
      'icon': 'Username',
      'action': 'profile',
      'title': 'My Profile'
    });
    this.settings.push({
      'hidden': false,
      'background': '#134482',
      'icon': 'Glasses',
      'action': 'appearance',
      'title': 'Appearance'
    });
    if (this.isStaff) {
      this.settings.push({
        'hidden': this.isKioskMode,
        'background': '#12C29E',
        'icon': 'Lock dots',
        'action': 'myPin',
        'title': 'Approval Pin'
      });
    }
    this.settings.push({
      'hidden': this.isKioskMode,
      'background': '#EBBB00',
      'icon': 'Star',
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      'hidden': this.isMobile,
      'background': '#E32C66',
      'icon': 'Notifications',
      'action': 'notifications',
      'title': 'Notifications'
    });
    this.settings.push({
      'hidden': this.isKioskMode || !this.isStaff,
      'background': '#EBBB00',
      'icon': 'Referal',
      'action': 'refer',
      'title': 'Refer a friend',
      'isNew': this.isStaff && this.intosData.referral_reminder ? (!this.intosData.referral_reminder.universal.seen_version && this.showNotificationBadge) : false
    });
  }
}
