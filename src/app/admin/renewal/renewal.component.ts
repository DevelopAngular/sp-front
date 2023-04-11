import { Component, OnInit, SecurityContext } from '@angular/core';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { AdminService, RenewalStatus } from '../../services/admin.service';
import _refiner from 'refiner-js';
import { NavbarElementsRefsService } from '../../services/navbar-elements-refs.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../services/user.service';
import { filter, map, take } from 'rxjs/operators';
import { User } from '../../models/User';

type ReminderData = {
	img: string;
	title: string;
	desc: string;
	button: string;
	action: () => void;
};

@Component({
	selector: 'app-renewal',
	templateUrl: './renewal.component.html',
	styleUrls: ['./renewal.component.scss'],
	host: {
		class: 'root-router-child',
	},
})
export class RenewalComponent implements OnInit {
	public selectedFeature = 0;
	public status: RenewalStatus;
	public reminder: ReminderData;
	public showRenewConfirm = false;
	public iframeLoading = true;
	private iframeLoadedInterval;
	private surveyId = '300ba7c0-ccad-11ed-b709-fb336f73b73f';

	public iFrameURL: SafeResourceUrl;

	constructor(
		private adminService: AdminService,
		public darkTheme: DarkThemeSwitch,
		private navbarService: NavbarElementsRefsService,
		private sanitizer: DomSanitizer,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.adminService.getRenewalData().subscribe({
			next: (data) => {
				this.status = data;
				switch (this.status.renewal_status) {
					case 'renewed_upgrade_available':
						this.reminder = {
							img: './assets/admin-images/upgrade-sub.png',
							title: 'Upgrade to Even More SmartPass',
							desc: 'How did we make SmartPass even smarter? Educators told us exactly what they needed. Enhanced usability. Better analytics. Improved safety.',
							button: 'Explore Upgrade Options',
							action: () => this.toggleConfirm(),
						};
						break;
					case 'expiring':
						const month = this.printExpiration(true);
						this.reminder = {
							img: './assets/admin-images/expiring-sub.png',
							title: month ? 'Your SmartPass Subscription Expires in ' + month : 'Your SmartPass Subscription Expires Soon',
							desc: 'As you plan your budget for next year, we’d like to make sure you have a SmartPass quote to continue your subscription.',
							button: 'Confirm Renewal Details',
							action: () => this.toggleConfirm(),
						};
						break;
				}
				// Show survey for expiring schools
				if (this.status.renewal_status === 'expiring') {
					_refiner('showForm', this.surveyId);
				}
				this.iFrameURL = this.sanitizer.bypassSecurityTrustResourceUrl(data.confirm_renewal_link + '?iframe=true');
				this.userService.user$
					.pipe(
						filter((u) => !!u),
						map((u) => User.fromJSON(u))
					)
					.subscribe((u) => {
						this.userService.registerThirdPartyPlugins(u, data);
					});
			},
		});

		this.navbarService.setPointerVisible(false);
		this.navbarService.setRenewalReminderFill(true);

		// Add an onload function to the iFrame which hides the loading spinner
		this.iframeLoadedInterval = setInterval(() => {
			const iframe = document.getElementById('renewal-iframe');
			if (iframe) {
				iframe.onload = () => (this.iframeLoading = false);
				clearInterval(this.iframeLoadedInterval);
			}
		}, 100);
	}

	ngOnDestroy() {
		this.navbarService.setRenewalReminderFill(false);
	}

	handleFeatureClick(clicked: number) {
		if (this.selectedFeature === clicked) {
			this.selectedFeature = 0;
		} else {
			this.selectedFeature = clicked;
		}
	}

	printExpiration(month = false): string {
		if (!this.status?.subscription_end_date) {
			return '';
		}
		let date = new Date(this.status.subscription_end_date);
		if (month) {
			return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long' });
		}
		return date.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
	}

	toggleConfirm() {
		this.showRenewConfirm = !this.showRenewConfirm;
		this.navbarService.setRenewalIFrameFill(this.showRenewConfirm);
	}
}
