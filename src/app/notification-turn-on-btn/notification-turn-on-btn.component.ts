import { Component, OnInit } from '@angular/core';
import { bumpIn } from '../animations';
import { NotificationService } from '../services/notification-service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationFormComponent } from '../notification-form/notification-form.component';
import { NotificationButtonService } from '../services/notification-button.service';
import { DeviceDetection } from '../device-detection.helper';
import { animate, group, style, transition, trigger } from '@angular/animations';

@Component({
	selector: 'app-notification-turn-on-btn',
	templateUrl: './notification-turn-on-btn.component.html',
	styleUrls: ['./notification-turn-on-btn.component.scss'],
	animations: [
		bumpIn,
		trigger('HideNotificationBtn', [
			transition(
				':leave',
				group([
					animate(
						'.5s ease',
						style({
							height: '0px',
							margin: '0px 0px',
							opacity: 0,
							transform: 'scaleY(0.1)',
						})
					),
				])
			),
		]),
	],
})
export class NotificationTurnOnBtnComponent implements OnInit {
	constructor(
		private notificationService: NotificationService,
		private notificationDialog: MatDialog,
		private notificationButtonService: NotificationButtonService
	) {}

	dismiss: boolean;
	buttonDown: boolean;
	dismissExpirationDate;

	ngOnInit() {
		this.dismissExpirationDate = this.notificationButtonService.dismissExpirtationDate;
		const notifBtnDismissExpires = localStorage.getItem('notif_btn_dismiss_expiration');

		if (notifBtnDismissExpires) {
			this.dismiss = true;
		}

		this.notificationButtonService.dismissButton$.subscribe((dismissed) => {
			this.dismiss = dismissed;
		});
	}

	dismissClick() {
		localStorage.setItem('notif_btn_dismiss_expiration', JSON.stringify(this.dismissExpirationDate));
		this.notificationButtonService.dismissButton$.next(true);
	}

	onClick() {
		Notification.requestPermission().then((permission) => {
			if (permission === 'denied') {
				this.notificationDialog.open(NotificationFormComponent, {
					panelClass: 'form-dialog-container',
					backdropClass: 'custom-backdrop',
					width: '462px',
					height: '600px',
				});
			}

			if (permission === 'default') {
				return;
			}

			this.notificationService.initNotifications(true);
		});
	}

	get buttonState() {
		return this.buttonDown ? 'down' : 'up';
	}

	get hasNotifyPermission() {
		return NotificationService.hasPermission;
	}

	get isSafari() {
		return DeviceDetection.isSafari() || DeviceDetection.isIOSMobile() || DeviceDetection.isIOSTablet();
	}
}
