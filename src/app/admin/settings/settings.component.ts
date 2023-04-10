import { Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { LocalizejsService } from '../../services/localizejs.service';
import { combineLatest, Subject } from 'rxjs';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
	private triggerElementRef: ElementRef;

	public isSwitchOption: boolean;
	public hoveredProfile: boolean;
	public hoveredSignout: boolean;
	private hovered: boolean;
	private hoveredColor: string;

	private destroy$ = new Subject();

	public settings = [
		{
			hidden: false,
			icon: 'Username',
			action: 'profile',
			title: 'My Profile',
		},
		{
			hidden: false,
			icon: 'Glasses',
			action: 'appearance',
			title: 'Appearance',
		},
		{
			hidden: false,
			icon: 'Language',
			action: 'language',
			title: 'Language',
			isNew: true,
		},
		{
			hidden: false,
			icon: 'Referal',
			action: 'refer',
			title: 'Refer a teacher',
			isNew: this.data['introsData'].referral_reminder
				? !this.data['introsData'].referral_reminder.universal.seen_version && this.data['showNotificationBadge']
				: false,
		},
	];

	constructor(
		private router: Router,
		public dialogRef: MatDialogRef<SettingsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public darkTheme: DarkThemeSwitch,
		private elemRef: ElementRef,
		private localize: LocalizejsService,
		private pwaStorage: LocalStorage
	) {}

	public ngOnInit(): void {
		this.triggerElementRef = this.data['trigger'];
		this.isSwitchOption = this.data['isSwitch'];
		this.updateSettingsPosition();
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public getIcon(iconName: string, setting: any, hover?: boolean, hoveredColor?: string): string {
		return this.darkTheme.getIcon({
			iconName: iconName,
			setting: setting,
			hover: hover,
			hoveredColor: hoveredColor,
		});
	}

	public getColor(dark, white): string {
		return this.darkTheme.getColor({ dark, white });
	}

	private handleAction(setting): void {
		if (typeof setting.action === 'string') {
			this.dialogRef.close(setting.action);
		} else {
			setting.action();
		}
	}

	private updateSettingsPosition(): void {
		if (this.dialogRef) {
			const matDialogConfig: MatDialogConfig = new MatDialogConfig();
			const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
			// This is a workaround for positioning the dialog when window has scrolled.
			// We need to determine the amount the window has scrolled, which is the
			// document's scrolling element's height and top (a negative value if it has scrolled)
			// minus the window's innerheight. Then add half the height of the triggering element.
			const bottom =
				document.scrollingElement.getClientRects()[0].height +
				document.scrollingElement.getClientRects()[0].top -
				window.innerHeight +
				rect.height / 2;
			matDialogConfig.position = { left: `${rect.left - 130}px`, bottom: `${bottom}px` };
			this.dialogRef.updatePosition(matDialogConfig.position);
		}
	}

	private onHover(color): void {
		this.hovered = true;
		this.hoveredColor = color;
	}

	public signOut(): void {
		this.dialogRef.close('signout');
		localStorage.removeItem('fcm_sw_registered');
		this.localize.setLanguageUntranslated();
		combineLatest(this.pwaStorage.removeItem('server'), this.pwaStorage.removeItem('authData')).subscribe();
	}
}
