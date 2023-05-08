// ngrx/intros/effects/referral-modal.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { tap, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { NuxReferralComponent } from '../../../nux-components/nux-referral/nux-referral.component';
import * as ReferralModalActions from '../actions/referral-modal.actions';
import { AppState } from '../../app-state/app-state';

@Injectable()
export class ReferralModalEffects {
	constructor(private actions$: Actions, private dialog: MatDialog, private store: Store<AppState>) {}

	openReferralModal$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(ReferralModalActions.openReferralModal),
				withLatestFrom(
					this.store.pipe(select((state: AppState) => state.user.user)),
					this.store.pipe(select((state: AppState) => state.schools.entities))
				),
				tap(([action, user, schoolEntities]) => {
					const userSchool = schoolEntities[user.school_id];

					const hasSeenModal = sessionStorage.getItem('hasSeenReferralModal');

					/* In production: (!hasSeenModal && user.referral_status === 'not_applied' && userSchool.feature_flag_referral_program) */
					if (!hasSeenModal && user.referral_status === 'not_applied' && userSchool.feature_flag_referral_program) {
						const dialogRef: MatDialogRef<NuxReferralComponent> = this.dialog.open(NuxReferralComponent, {
							data: {
								roles: user.roles,
							},
							panelClass: 'referral-dialog-container',
						});

						sessionStorage.setItem('hasSeenReferralModal', 'true');
					}
				})
			),
		{ dispatch: false }
	);
}
