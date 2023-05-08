import { Component, OnInit } from '@angular/core';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { AdminService, RenewalStatus } from '../../services/admin.service';
import _refiner from 'refiner-js';
import { NavbarElementsRefsService } from '../../services/navbar-elements-refs.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../services/user.service';
import { filter, map } from 'rxjs/operators';
import { User } from '../../models/User';
import { DatePipe } from '@angular/common';
import { TeacherReviewsService } from '../../services/teacher-reviews.service';
import { Observable } from 'rxjs';

type ReminderData = {
	img: string;
	title: string;
	desc: string;
	button: string;
	action: () => void;
};

interface TeacherReview {
	name: string;
	what_to_display: string;
	stars: number;
	testimonial: string;
	first_shown: string;
}

@Component({
	selector: 'app-renewal',
	templateUrl: './renewal.component.html',
	styleUrls: ['./renewal.component.scss'],
	host: {
		class: 'root-router-child',
	},
	providers: [DatePipe],
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
	teacherReviews$: Observable<TeacherReview[]>;

	constructor(
		private adminService: AdminService,
		public darkTheme: DarkThemeSwitch,
		private navbarService: NavbarElementsRefsService,
		private sanitizer: DomSanitizer,
		private userService: UserService,
		private datepipe: DatePipe,
		private teacherReviewsService: TeacherReviewsService
	) {}

	ngOnInit(): void {
		this.teacherReviews$ = this.teacherReviewsService.getReviews();

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
						const month = this.datepipe.transform(this.status?.subscription_end_date, 'MMMM', 'UTC');
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
					setTimeout(() => {
						console.log('Showing renewal refiner survey');
						_refiner('showForm', this.surveyId);
					}, 1000);
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

	toggleConfirm() {
		this.showRenewConfirm = !this.showRenewConfirm;
		this.navbarService.setRenewalIFrameFill(this.showRenewConfirm);
	}
}
