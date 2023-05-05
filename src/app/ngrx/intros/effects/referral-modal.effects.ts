// ngrx/intros/effects/referral-modal.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { NuxReferralComponent } from "../../../nux-components/nux-referral/nux-referral.component"
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
          this.dialog.open(NuxReferralComponent, {
            width: '400px',
            data: {}
          });
        })
      ),
    { dispatch: false }
  );
}
