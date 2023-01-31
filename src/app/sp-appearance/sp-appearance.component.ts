import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DarkThemeSwitch, SPTheme } from '../dark-theme-switch';
import { StorageService } from '../services/storage.service';
import { ScreenService } from '../services/screen.service';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-sp-appearance',
	templateUrl: './sp-appearance.component.html',
	styleUrls: ['./sp-appearance.component.scss'],
})
export class SpAppearanceComponent implements OnInit, OnDestroy {
	selectedTheme: string;
	isList: boolean;
	hideLayoutSettings: boolean;
	form: FormGroup;
	user: User;
	isStaff: boolean;
	showStudentProfileLocation: string = 'Hall Monitor';
	showLocationPiker: boolean;
	showWrapper: boolean;

	isEnableProfilePictures$: Observable<boolean>;

	destroy$: Subject<any> = new Subject<any>();

	constructor(
		private darkTheme: DarkThemeSwitch,
		public dialogRef: MatDialogRef<SpAppearanceComponent>,
		private storage: StorageService,
		private screenService: ScreenService,
		private userService: UserService,
		public router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	get IpadDevice() {
		return this.screenService.isIpadWidth;
	}
	get extraLargeDevice() {
		return this.screenService.isDeviceLargeExtra;
	}

	ngOnInit() {
		if (this.data && this.data['fromFilter']) {
			this.showWrapper = this.data['fromFilter'];
			setTimeout(() => {
				this.showWrapper = false;
			}, 2000);
		}
		this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;

		this.selectedTheme = this.darkTheme.currentTheme();
		this.isList = JSON.parse(this.storage.getItem('isGrid'));
		this.hideLayoutSettings = this.router.url.includes('/admin');
		this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
			this.user = user;
			this.isStaff = User.fromJSON(user).isTeacher() || User.fromJSON(user).isAssistant();
			if (!!user.show_profile_pictures) {
				this.showStudentProfileLocation = this.showProfilePicturesNormalize(user.show_profile_pictures);
			}
			this.form = new FormGroup({
				show_expired_passes: new FormControl(user.show_expired_passes),
				show_student_profile_picture: new FormControl(!!user.show_profile_pictures),
			});
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	showProfilePicturesNormalize(value) {
		if (value === 'hall_monitor') {
			return 'Hall Monitor';
		} else if (value === 'everywhere') {
			return 'Everywhere';
		}
	}

	updateProfilePictures(isShow) {
		if (isShow) {
			const show_profile_pictures = this.showStudentProfileLocation === 'Hall Monitor' ? 'hall_monitor' : 'everywhere';
			this.updateUser({ show_profile_pictures });
		} else {
			this.updateUser({ show_profile_pictures: null });
		}
	}

	switchProfileLocation(value) {
		if (value !== this.showStudentProfileLocation) {
			this.showStudentProfileLocation = value;
			this.updateProfilePictures(true);
		}
	}

	setSelectedTheme(evt: SPTheme) {
		this.selectedTheme = evt;
		this.darkTheme.switchTheme(evt);
	}

	selectedLayout(evt) {
		this.storage.setItem('isGrid', evt === 'List');
	}

	updateUser(value) {
		this.userService.updateUserRequest(this.user, value);
	}
}
