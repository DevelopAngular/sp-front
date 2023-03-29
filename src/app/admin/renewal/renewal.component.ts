import { Component, OnInit } from '@angular/core';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { AdminService, RenewalStatus } from '../../services/admin.service';
import { HelpCenterService } from '../../services/help-center.service';
import _refiner from 'refiner-js';
import { NavbarElementsRefsService } from '../../services/navbar-elements-refs.service';
import { Router } from '@angular/router';

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
})
export class RenewalComponent implements OnInit {
	public selectedFeature = 0;
	public status: RenewalStatus;
	public reminder: ReminderData;
	public showRenewConfirm = false;
	private surveyId = '300ba7c0-ccad-11ed-b709-fb336f73b73f';

	constructor(
		private adminService: AdminService,
		private helpCenterService: HelpCenterService,
		public darkTheme: DarkThemeSwitch,
		private navbarService: NavbarElementsRefsService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.adminService.getRenewalData().subscribe({
			next: (data) => {
				this.status = data;
				switch (this.status.renewal_status) {
					case 'renewed':
						this.reminder = {
							img: './assets/admin-images/upgrade-sub.png',
							title: 'You’re All Set for the New School Year!',
							desc: 'Are there other schools in your area that could benefit from SmartPass? Spread the word and help us with our mission to make all schools safer and smarter.',
							button: 'Refer a School',
							action: () => this.openRenewalRoute(),
						};
						break;
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
							title: month ? 'Your SmartPass Subscription Expires in ' + month : 'Your SmartPass Subscription Will Expire',
							desc: 'As you plan your budget for next year, we’d like to make sure you have a SmartPass quote to continue your subscription.',
							button: 'Confirm Renewal Details',
							action: () => this.toggleConfirm(),
						};
						break;
					default:
						this.reminder = {
							img: './assets/admin-images/upgrade-sub.png',
							title: 'Thanks for using SmartPass!',
							desc: 'Are there other schools in your area that could benefit from SmartPass? Spread the word and help us with our mission to make all schools safer and smarter.',
							button: 'Refer a School',
							action: () => this.openRenewalRoute(),
						};
				}
				// Show survey for expiring schools
				if (this.status.renewal_status === 'expiring') {
					_refiner('showForm', this.surveyId);
				}
			},
		});

		this.navbarService.setPointerVisible(false);
		this.navbarService.setRenewalFill(true);
	}

	ngOnDestroy() {
		this.navbarService.setRenewalFill(false);
	}

	handleFeatureClick(clicked: number) {
		if (this.selectedFeature === clicked) {
			this.selectedFeature = 0;
		} else {
			this.selectedFeature = clicked;
		}
	}

	openHelpCenter() {
		this.helpCenterService.openHelp();
	}

	openRenewalRoute() {
		this.router.navigate(['renewal']);
	}

	printExpiration(month = false): string {
		if (!this.status?.subscription_end_date) {
			return '';
		}
		let date = new Date(this.status.subscription_end_date);
		if (month) {
			return date.toLocaleDateString('en-US', { month: 'long' });
		}
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	toggleConfirm() {
		this.showRenewConfirm = !this.showRenewConfirm;
	}
}
