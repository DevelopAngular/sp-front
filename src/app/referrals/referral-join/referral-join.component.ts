import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User, ReferralStatus } from '../../models/User';
import { finalize, map, takeWhile, tap } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { interval } from 'rxjs';

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
	@Input() user: User = null;
	termsAccepted = false;
	referralRockLoaded = false;
	showValidationMsg = false;
	makingRequest = false;

	constructor(private userService: UserService, private toast: ToastService) {
		this.initReferralRock();
	}

	initReferralRock() {
		window.referralJS = window.referralJS || {};
		window.referralJS.scriptConfig = {
			parameters: { src: '//smartpass.referralrock.com/ReferralSdk/referral.js', transactionKey: 'f99edca6-ab8e-486e-964e-885e7bdaf31f' },
		};
		(function (f, r, n, _, b, y) {
			(b = f.createElement(r)), (y = f.getElementsByTagName(r)[0]);
			b.async = 1;
			b.src = n + '?referrer=' + encodeURIComponent(window.location.origin + window.location.pathname).replace(/[!'()*]/g, encodeURIComponent);
			b.id = 'RR_DIVID_V5';
			b.setAttribute('transactionKey', window.referralJS.scriptConfig.parameters.transactionKey);
			y.parentNode.insertBefore(b, y);
		})(document, 'script', window.referralJS.scriptConfig.parameters.src);
	}

	ngOnInit(): void {
		this.loadReferralRockFrame();
		interval(500)
			.pipe(
				takeWhile(() => this.referralRockIframePresent() && !this.referralRockLoaded),
				tap(() => {
					this.loadReferralRockFrame();
					this.checkReferralRockIframeLoaded();
				})
			)
			.subscribe();
	}

	// Loads the referral rock iFrame. The timing can be wonky, so we repeat it
	loadReferralRockFrame() {
		if (this.user) {
			window.referralJS.access = {
				targetId: 'referral-frame',
				parameters: {
					view: 'iframe',
					programIdentifier: '8fd54047-b36c-430e-8f2d-1546fc4b3675',
					email: this.user.primary_email,
				},
			};
		}
	}

	// If the iFrame isn't present, don't bother running the script
	referralRockIframePresent(): boolean {
		return !!document.getElementById('referral-frame');
	}

	// Check if referral rock is loaded
	checkReferralRockIframeLoaded() {
		if (document.getElementById('referral-frame')?.hasAttribute('src')) {
			this.referralRockLoaded = true;
		}
	}

	apply(): void {
		if (!this.termsAccepted) {
			this.showValidationMsg = true;
			return;
		}
		this.makingRequest = true;
		this.userService
			.applyForReferral()
			.pipe(
				map((resp: Record<string, unknown>) => {
					return resp?.referral_status ? (resp.referral_status as ReferralStatus) : undefined;
				}),
				finalize(() => (this.makingRequest = false))
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
		if (this.termsAccepted) {
			this.showValidationMsg = false;
		}
	}
}
