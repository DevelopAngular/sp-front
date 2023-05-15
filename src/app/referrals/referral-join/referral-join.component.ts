import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User, ReferralStatus } from '../../models/User';
import { concatMap, finalize, map } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';

type referralRockJS = {
	scriptConfig?: { parameters: { src: string; transactionKey: string } };
	access?: {
		targetId: string;
		parameters: {
			view: string;
			programIdentifier: string;
			email: string;
		};
	};
};

declare const window: Window & typeof globalThis & { referralJS: referralRockJS };

@Component({
	selector: 'sp-referral-join',
	templateUrl: './referral-join.component.html',
	styleUrls: ['../referral-page/referral-page.component.scss'],
})
export class ReferralJoinComponent implements OnInit {
	user: User;
	termsAccepted = false;

	constructor(private userService: UserService, private toast: ToastService) {
		this.setUpReferralRock();
	}

	setUpReferralRock(): void {
		window.referralJS = window.referralJS || {};
		window.referralJS.scriptConfig = {
			parameters: { src: '//smartpass.referralrock.com/ReferralSdk/referral.js', transactionKey: 'f99edca6-ab8e-486e-964e-885e7bdaf31f' },
		};
		(function (f, r, n, _, b, y) {
			(b = f.createElement(r)), (y = f.getElementsByTagName(r)[0]);
			b.async = 1;
			b.src = n + '?referrer=' + encodeURIComponent(window.location.origin + window.location.pathname).replace(/[!'()*]/g, escape);
			b.id = 'RR_DIVID_V5';
			b.setAttribute('transactionKey', window.referralJS.scriptConfig.parameters.transactionKey);
			y.parentNode.insertBefore(b, y);
		})(document, 'script', window.referralJS.scriptConfig.parameters.src);
	}

	ngOnInit(): void {
		this.userService.userData.pipe(concatMap((user) => this.userService.getUserById(user.id))).subscribe({
			next: (user) => {
				this.user = User.fromJSON(user);
				window.referralJS.access = {
					targetId: 'referral-frame',
					parameters: {
						view: 'iframe',
						programIdentifier: '8fd54047-b36c-430e-8f2d-1546fc4b3675',
						email: user.primary_email,
					},
				};
			},
		});
	}

	apply(): void {
		this.toggleTerms();
		this.userService
			.applyForReferral()
			.pipe(
				map((resp: Record<string, any>) => {
					return resp?.referral_status ? (resp.referral_status as ReferralStatus) : undefined;
				}),
				finalize(() => this.toggleTerms())
			)
			.subscribe({
				next: (status) => {
					if (status) {
						this.user.referral_status = status;
					}
				},
				error: (err) => {
					this.toast.openToast({
						title: 'Error while signing you up',
						subtitle: 'Please try refreshing the page.',
						type: 'error',
					});
					console.log(err);
				},
			});
	}

	toggleTerms(): void {
		this.termsAccepted = !this.termsAccepted;
	}
}
