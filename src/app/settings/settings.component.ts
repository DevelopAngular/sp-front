import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { User } from '../models/User';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { KioskModeService } from '../services/kiosk-mode.service';
import { SideNavService } from '../services/side-nav.service';
import { Router } from '@angular/router';
import { LocalizejsService } from '../services/localizejs.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { combineLatest, Observable, Subject } from 'rxjs';
import { DeviceDetection } from '../device-detection.helper';
import { UserService } from '../services/user.service';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
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

type DialogData = {
	trigger: ElementRef;
	isSwitch: boolean;
	settings?: DialogDataSetting[];
};

// todo from typescript 4.1
//type hex = `#${string}`;
type hex = string;

type DialogDataSetting = {
	hidden: boolean;
	background: hex;
	icon: string;
	action: string;
	title: string;
	isNew: boolean;
};

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
	teacherPin$: Observable<string | number>;
	private adjustForScroll: boolean = false;

	destroy$: Subject<any> = new Subject<any>();

	constructor(
		public dialog: MatDialog,
		@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData,
		@Optional() public dialogRef: MatDialogRef<SettingsComponent>,
		private sideNavService: SideNavService,
		public darkTheme: DarkThemeSwitch,
		public kioskMode: KioskModeService,
		private router: Router,
		private pwaStorage: LocalStorage,
		private userService: UserService,
		private localize: LocalizejsService
	) {
		// this.initializeSettings();
		if (data && data['adjustForScroll']) {
			this.adjustForScroll = data['adjustForScroll'];
		}
	}

	get isKioskMode(): boolean {
		// return !!this.kioskMode.getCurrentRoom().value;
		return this.kioskMode.isKisokMode();
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	get showNotificationBadge() {
		return this.user && moment(this.user.first_login).add(30, 'days').isSameOrBefore(moment());
	}

	ngOnInit() {
		this.teacherPin$ = this.userService.userPin$;

		const user$ = this.userService.user$.pipe(
			filter((user) => !!user),
			takeUntil(this.destroy$)
		);

		/*user$.subscribe({next: (user: User) => {
      this.user = User.fromJSON(user);
      this.isStaff = this.user.isTeacher() || this.user.isAssistant();
    }});*/

		const intro$ = this.userService.introsData$.pipe(takeUntil(this.destroy$));

		//intro$.subscribe({next: intros => this.intosData = intros});

		intro$.pipe(withLatestFrom(user$)).subscribe({
			next: ([intros, user]) => {
				this.user = User.fromJSON(user);
				this.isStaff = this.user.isTeacher() || this.user.isAssistant();
				this.intosData = intros;
				// data.settings has prority
				if (!this?.data?.settings) {
					this.settings = [];
					this.initializeSettings();
				}
			},
		});

		if (this.data) {
			this.targetElementRef = this.data['trigger'];
			this.isSwitch = this.data['isSwitch'] && !this.kioskMode.getCurrentRoom().value;
			// overwrite existent settings
			if (this.data.settings) {
				this.settings = this.data.settings;
			}
		}

		this.sideNavService.sideNavData.pipe(takeUntil(this.destroy$)).subscribe((sideNavData) => {
			if (sideNavData) {
				this.targetElementRef = sideNavData['trigger'];
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
			setting: setting,
		});
	}

	getColor(dark, white) {
		return this.darkTheme.getColor({
			dark,
			white,
		});
	}

	onHover(color) {
		this.hovered = true;
		this.hoveredColor = color;
	}

	handleAction(setting) {
		if (!this.dialogRef && typeof setting.action === 'string') {
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
		let scrollAdjustment = 0;
		if (this.adjustForScroll) {
			scrollAdjustment = Math.abs(document.scrollingElement.getClientRects()[0].top);
		}
		if (this.targetElementRef && this.dialogRef) {
			const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
			matDialogConfig.position = { left: `${rect.left + rect.width / 2 - 230}px`, top: `${rect.bottom + scrollAdjustment + 10}px` };
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
		this.localize.setLanguageUntranslated();
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

		combineLatest(this.pwaStorage.removeItem('server'), this.pwaStorage.removeItem('authData'), this.pwaStorage.removeItem('current-kiosk-room'))
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
			hidden: this.isKioskMode,
			background: '#6651FF',
			icon: 'Username',
			action: 'profile',
			title: 'My Profile',
		});
		this.settings.push({
			hidden: false,
			background: '#134482',
			icon: 'Glasses',
			action: 'appearance',
			title: 'Appearance',
		});
		this.settings.push({
			hidden: false,
			background: '#134482',
			icon: 'Language',
			action: 'language',
			title: 'Language',
			isNew: true,
		});
		if (this.isStaff) {
			this.settings.push({
				hidden: this.isKioskMode,
				background: '#12C29E',
				icon: 'Lock dots',
				action: 'myPin',
				title: 'Approval Pin',
			});
		}
		this.settings.push({
			hidden: this.isKioskMode,
			background: '#EBBB00',
			icon: 'Star',
			action: 'favorite',
			title: 'Favorites',
		});
		this.settings.push({
			hidden: this.isMobile || this.isKioskMode,
			background: '#E32C66',
			icon: 'Notifications',
			action: 'notifications',
			title: 'Notifications',
		});
		this.settings.push({
			hidden: this.isKioskMode || !this.isStaff,
			background: '#EBBB00',
			icon: 'Referal',
			action: 'refer',
			title: 'Refer a teacher',
			isNew:
				this.isStaff && this.intosData.referral_reminder
					? !this.intosData.referral_reminder.universal.seen_version && this.showNotificationBadge
					: false,
		});
	}
}
