// ngrx/intros/effects/referral-modal.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
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
				tap(() => {
					const dialogRef: MatDialogRef<NuxReferralComponent> = this.dialog.open(NuxReferralComponent, {
						data: {
							isAdmin: isAdminValue,
						},
						width: '509px',
						panelClass: 'referral-dialog-container',
					});

					dialogRef.afterOpened().subscribe(() => {
						const matDialogContainer = dialogRef['_containerInstance']['_elementRef'].nativeElement;
						matDialogContainer.style.borderRadius = '12px';
					});
				})
			),
		{ dispatch: false }
	);
}

//   openReferralModal$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(ReferralModalActions.openReferralModal),
//         tap(() => {
//           const hasSeenModal = localStorage.getItem('hasSeenReferralModal');

//           if (!hasSeenModal) {
//             const dialogRef: MatDialogRef<NuxReferralComponent> = this.dialog.open(NuxReferralComponent, {
//               data: {},
//               width: "509px",
//               panelClass: 'referral-dialog-container',
//             });

//             dialogRef.afterOpened().subscribe(() => {
//               const matDialogContainer = dialogRef['_containerInstance']['_elementRef'].nativeElement;
//               matDialogContainer.style.borderRadius = '12px';
//             });

//             localStorage.setItem('hasSeenReferralModal', 'true');
//           }
//         })
//       ),
//     { dispatch: false }
//   );
// }
