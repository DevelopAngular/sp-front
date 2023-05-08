import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { AppState } from '../ngrx/app-state/app-state';
import { NuxReferralComponent } from '../nux-components/nux-referral/nux-referral.component';

@Injectable({
	providedIn: 'root',
})
export class ReferralModalService {
	constructor(private store: Store<AppState>, private dialog: MatDialog) {}

	openNuxReferralModal(): void {
		this.store
			.select((state: AppState) => ({
				user: state.user.user,
				schoolEntities: state.schools.entities,
			}))
			.pipe(
				take(1),
				tap(({ user, schoolEntities }) => {
					const userSchool = schoolEntities[user.school_id];
					const hasSeenModal = sessionStorage.getItem('hasSeenReferralModal');

					/* In production: (!hasSeenModal && user.referral_status === 'not_applied' && userSchool.feature_flag_referral_program) */
					if (hasSeenModal === null && user.referral_status === 'not_applied' && userSchool.feature_flag_referral_program) {
						const dialogRef = this.dialog.open(NuxReferralComponent, {
							data: {
								roles: user.roles,
							},
							panelClass: 'referral-dialog-container',
						});

						sessionStorage.setItem('hasSeenReferralModal', 'true');
					}
				})
			)
			.subscribe();
	}
}
