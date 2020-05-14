import {Component, ElementRef, Inject, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {BUILD_DATE, RELEASE_NAME} from '../../../build-info';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {combineLatest, Subject} from 'rxjs';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {takeUntil} from 'rxjs/operators';
import {SpAppearanceComponent} from '../../sp-appearance/sp-appearance.component';
import {DeviceDetection} from '../../device-detection.helper';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  triggerElementRef: ElementRef;

  isSwitchOption: boolean;
  showGetStarted: boolean;
  hoveredProfile: boolean;
  hoveredTheme: boolean;
  pressedTheme: boolean;
  hoveredSignout: boolean;
  hovered: boolean;
  hoveredColor: string;
  version = 'Version 1.5';
  currentRelease = RELEASE_NAME;

  destroy$ = new Subject();

    public settings = [
        // {
        //   'background': '#139BE6',
        //   'icon': 'Team',
        //   'hover_icon': './assets/Team (White).svg',
        //   'action': 'about',
        //   'title': 'About'
        // },
        // {
        //   'background': '#6651F1',
        //   'icon': 'Launch',
        //   'hover_icon': './assets/Launch (White).svg',
        //   'action': 'wishlist',
        //   'title': 'Wishlist'
        // },
        // {
        //   'background': '#F53D45',
        //   'icon': 'Support',
        //   'hover_icon': './assets/Support (White).svg',
        //   'action': 'support',
        //   'title': 'Support'
        // },
        // {
        //   'background': '#fc7303',
        //   'icon': 'Bug',
        //   'hover_icon': './assets/Bug (White).svg',
        //   'action': 'bug',
        //   'title': 'Bug Report'
        // },
    ];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public darkTheme: DarkThemeSwitch,
    private elemRef: ElementRef,
    private pwaStorage: LocalStorage,
    private dialog: MatDialog,
    public gsProgress: GettingStartedProgressService,
  ) {
  }

  get _themeBackground() {
    return this.hoveredTheme
      ?
      !this.darkTheme.isEnabled$.value
        ?
        '#134482'
          : 'rgb(228, 235, 255)'
            : 'transparent';
  }

  ngOnInit() {
    this.gsProgress.onboardProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.showGetStarted = res.progress === 100;
      });
    this.triggerElementRef = this.data['trigger'];
    this.isSwitchOption = this.data['isSwitch'];
    this.updateSettingsPosition();
  }

  switchTheme() {
    this.pressedTheme = false;
    // this.data.darkBackground = !this.data.darkBackground;
    this.dialog.open(SpAppearanceComponent, {
      panelClass: 'form-dialog-container',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIcon(iconName: string, setting: any,  hover?: boolean, hoveredColor?: string) {

    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
    });
  }

  getColor(dark, white) {
    return this.darkTheme.getColor({ dark, white });
  }

  handleAction(setting) {
    if ( typeof setting.action === 'string' ) {
      this.dialogRef.close(setting.action);
    } else {
      setting.action();
    }
  }

  updateSettingsPosition() {
    if (this.dialogRef) {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
      const top = rect.top - (!this.isSwitchOption ? 215 : (DeviceDetection.isSafari() ? 300 : 300));
      matDialogConfig.position = {left: `${rect.left - 130}px`, top: `${top}px`};
      this.dialogRef.updatePosition(matDialogConfig.position);
    }
  }

  onHover(color) {
    this.hovered = true;
    this.hoveredColor = color;
  }

  signOut() {
    this.dialogRef.close('signout');
    localStorage.removeItem('fcm_sw_registered');
    combineLatest(this.pwaStorage.removeItem('servers'),
      this.pwaStorage.removeItem('authData') )
      .subscribe();
  }
}
