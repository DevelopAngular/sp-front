import {Component, ElementRef, HostListener, Inject, Input, NgZone, OnInit, Optional} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { User } from '../models/User';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {RELEASE_NAME} from '../../build-info';
import {KioskModeService} from '../services/kiosk-mode.service';
import {SideNavService} from '../services/side-nav.service';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {combineLatest} from 'rxjs';
import {DeviceDetection} from '../device-detection.helper';

export interface Setting {
  id: number;
  hidden: boolean;
  gradient: string;
  icon: string;
  action: string | Function;
  title: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class SettingsComponent implements OnInit {

  @Input() dataSideNav: any = null;

  targetElementRef: ElementRef;
  settings: Setting[] = [];
  user: User;
  isStaff: boolean;

  isSwitch: boolean;

  hoveredMasterOption: boolean;
  hoveredTheme: boolean;
  pressedTheme: boolean;
  hoveredSignout: boolean;
  hovered: boolean;
  hoveredColor: string;
  hoverId: number;
  version = 'Version 1.5';
  currentRelease = RELEASE_NAME;

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

  ) {}

  ngOnInit() {
    if (this.data) {
      this.targetElementRef = this.data['trigger'];
      this.isSwitch = this.data['isSwitch'] && !this.kioskMode.currentRoom$.value;
    }

    this.sideNavService.sideNavData$.subscribe( sideNavData => {
      if (sideNavData) {
        this.targetElementRef = sideNavData['trigger'];
        this.isSwitch = sideNavData['isSwitch'] && !this.kioskMode.currentRoom$.value;
      }
    });

    this.sideNavService.toggle$.subscribe(() => {
      this.settings = [];
      this.initializeSettings();
    });

    this.updateDialogPosition();
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.isTeacher();
          this.initializeSettings();
        });
      });
  }

  getIcon(iconName: string, setting: any,  hover?: boolean, hoverId?: number) {
    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting,
      hover: hover,
      hoverId: hoverId
    });
  }

  getColor(setting?, hover?: boolean, hoverId?: number) {
    return this.darkTheme.getColor({
      setting: setting,
      hover: hover,
      hoverId: hoverId
    });
  }

  onHover({color, id}) {
    this.hovered = true;
    this.hoveredColor = color;
    this.hoverId = id;
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
      this.pwaStorage.removeItem('authData') )
      .subscribe();
  }

  initializeSettings() {
    if (this.isStaff) {
      this.settings.push({
        id: 1,
        'hidden': !!this.kioskMode.currentRoom$.value,
        'gradient': '#03CF31, #00B476',
        'icon': 'Lock',
        'action': 'myPin',
        'title': 'My Pin'
      });
    }
    this.settings.push({
      id: 2,
      'hidden': !!this.kioskMode.currentRoom$.value,
      'gradient': '#E7A700, #EFCE00',
      'icon': 'Star',
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      id: 3,
      'hidden': !!this.kioskMode.currentRoom$.value || DeviceDetection.isIOSMobile() || DeviceDetection.isIOSTablet(),
      'gradient': '#DA2370, #FB434A',
      'icon': 'Notifications',
      'action': 'notifications',
      'title': 'Notifications'
    });
    this.settings.push({
      id: 4,
      'hidden': false,
      'gradient': '#022F68, #2F66AB',
      'icon': 'Moon',
      'action': () => {
        this.darkTheme.switchTheme();
        if (this.data) {
          this.data.darkBackground = !this.data.darkBackground;
        }

        if (this.dataSideNav) {
          this.dataSideNav.darkBackground = !this.dataSideNav.darkBackground;
        }
      },
      'title': (this.darkTheme.isEnabled$.value ? 'Light Mode' : 'Dark Mode')
    });
    this.settings.push({
      id: 5,
      'hidden': !!this.kioskMode.currentRoom$.value,
      'gradient': '#03CF31, #00B476',
      'icon': 'Info',
      'action': 'intro',
      'title': 'View Intro'
    });
    this.settings.push({
      id: 6,
      'hidden': false,
      'gradient': '#0B9FC1, #00C0C7',
      'icon': 'Team',
      'action': 'about',
      'title': 'About'
    });
    this.settings.push({
      id: 7,
      'hidden': !!this.kioskMode.currentRoom$.value || !(this.user && (this.user.isAdmin() || this.user.isTeacher())),
      'gradient': '#5E4FED, #7D57FF',
      'icon': 'Launch',
      'action': 'wishlist',
      'title': 'Wishlist'
    });
    this.settings.push({
      id: 8,
      'hidden': false,
      'gradient': '#F52B4F, #F37426',
      'icon': 'Support',
      'action': 'support',
      'title': 'Support'
    });
  }
}
