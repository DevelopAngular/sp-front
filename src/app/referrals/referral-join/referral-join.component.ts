import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { HttpService } from '../../services/http-service';
import { finalize, map } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';

@Component({
	selector: 'sp-referral-join',
	templateUrl: './referral-join.component.html',
	styleUrls: ['../referral-page/referral-page.component.scss'],
})
export class ReferralJoinComponent implements OnInit {
	user: User;
	termsAccepted = false;

	constructor(private userService: UserService, private httpService: HttpService, private toast: ToastService) {}

	ngOnInit(): void {
		this.userService.userData.subscribe({
			next: (user) => {
				this.user = user;
			},
		});
	}

	apply(): void {
		this.toggleTerms();
		this.httpService
			.post('v2/user/referral/apply', {}, undefined, false)
			.pipe(
				map((resp: Record<string, any>) => {
					resp.roles = this.user.userRoles();
					return User.fromJSON(resp);
				}),
				finalize(() => this.toggleTerms())
			)
			.subscribe({
				next: (user: User) => {
					if (user) {
						this.user = user;
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
