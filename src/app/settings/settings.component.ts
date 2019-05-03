import {Component, ElementRef, Inject, Input, NgZone, OnInit, Optional} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { User } from '../models/User';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {RELEASE_NAME} from '../../build-info';
import {KioskModeService} from '../services/kiosk-mode.service';
import {trigger} from '@angular/animations';
import {SideNavService} from '../services/side-nav.service';

export interface Setting {
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
  version = 'Version 1.3';
  currentRelease = RELEASE_NAME;
  @Input() dataSideNav: any = null;

  constructor(
      public dialog: MatDialog,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      @Optional() public dialogRef: MatDialogRef<SettingsComponent>,
      private dataService: DataService,
      private _zone: NgZone,
      private sideNavService: SideNavService,
      public loadingService: LoadingService,
      public darkTheme: DarkThemeSwitch,
      public kioskMode: KioskModeService

  ) {
    this.settings.push({
      'hidden': !!this.kioskMode.currentRoom$.value,
      'gradient': '#E7A700, #EFCE00',
      'icon': 'Star',
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      'hidden': !!this.kioskMode.currentRoom$.value,
      'gradient': '#DA2370, #FB434A',
      'icon': 'Notifications',
      'action': 'notifications',
      'title': 'Notifications'
    });
    this.settings.push({
      'hidden': false,
      'gradient': '#022F68, #2F66AB',
      'icon': 'Moon',
      'action': () => {
        this.darkTheme.switchTheme();
        if (this.data) {
          this.data.darkBackground = !this.data.darkBackground;
        }

        if(this.dataSideNav) {
          this.dataSideNav.darkBackground = !this.dataSideNav.darkBackground;
        }
      },
      'title': (this.darkTheme.isEnabled$.value ? 'Light Theme' : 'Dark Theme')
    });
    this.settings.push({
      'hidden': !!this.kioskMode.currentRoom$.value,
      'gradient': '#03CF31, #00B476',
      'icon': 'Info',
      'action': 'intro',
      'title': 'View Intro'
    });
    this.settings.push({
      'hidden': false,
      'gradient': '#0B9FC1, #00C0C7',
      'icon': 'Team',
      'action': 'about',
      'title': 'About'
    });
    this.settings.push({
      'hidden': false,
        'gradient': '#5E4FED, #7D57FF',
        'icon': 'Feedback',
        'action': 'feedback',
        'title': 'Feedback'
    });
    this.settings.push({
      'hidden': false,
      'gradient': '#F52B4F, #F37426',
      'icon': 'Support',
      'action': 'support',
      'title': 'Support'
    });
  }

  get _themeBackground() {
    return this.hoveredTheme
              ?
              this.pressedTheme
                ?
                'radial-gradient(circle at 73% 71%, #022F68, #2F66AB)'
                  : 'rgb(228, 235, 255)'
                    : 'transparent';
  }

  ngOnInit() {
    if (this.data) {
      this.targetElementRef = this.data['trigger'];
      this.isSwitch = this.data['isSwitch'] && !this.kioskMode.currentRoom$.value;
    }

    this.sideNavService.sideNavData.subscribe( sideNavData => {
      if (sideNavData) {
        this.targetElementRef = sideNavData['trigger'];
        this.isSwitch = sideNavData['isSwitch'] && !this.kioskMode.currentRoom$.value;
      }
    });

    this.updateDialogPosition();
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });
      });
  }

  getIcon(iconName: string, setting: any,  hover?: boolean, hoveredColor?: string) {
    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
    });
  }

  getColor(setting?, hover?: boolean, hoveredColor?: string) {
    return this.darkTheme.getColor({
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
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
    if (this.targetElementRef) {
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 168 }px`, top: `${rect.bottom + 10}px` };
      this.dialogRef.updatePosition(matDialogConfig.position);
    }

  }
}
