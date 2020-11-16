import {Component, ElementRef, Inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {RELEASE_NAME} from '../../../build-info';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {combineLatest, Subject} from 'rxjs';

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
  hoveredSignout: boolean;
  hovered: boolean;
  hoveredColor: string;
  version = 'Version 1.5';
  currentRelease = RELEASE_NAME;

  destroy$ = new Subject();

  public settings = [
    {
      'hidden': false,
      'icon': 'Username',
      'action': 'profile',
      'title': 'My Profile'
    },
    {
      'hidden': false,
      'icon': 'Glasses',
      'action': 'appearance',
      'title': 'Appearance'
    },
    {
      'hidden': false,
      'icon': 'Referal',
      'action': 'refer',
      'title': 'Refer a friend',
      'isNew': this.data['introsData'].referral_reminder ?
        (!this.data['introsData'].referral_reminder.universal.seen_version && this.data['showNotificationBadge'])
        : false
    }
  ];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public darkTheme: DarkThemeSwitch,
    private elemRef: ElementRef,
    private pwaStorage: LocalStorage
  ) {
  }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.isSwitchOption = this.data['isSwitch'];
    this.updateSettingsPosition();
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
      const top = rect.top - (!this.isSwitchOption ? 240 : (!this.showGetStarted ? 285 : 330));
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
