import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as invitationsActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Invitation} from '../../../../../models/Invitation';

@Injectable()
export class InvitationsEffects {

  getInvitations$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(invitationsActions.getInvitations),
        switchMap((action: any) => {
          return this.liveDataService.watchInboxInvitations(action.user)
            .pipe(
              map((invitations: Invitation[]) => {
                return invitationsActions.getInvitationsSuccess({invitations});
              }),
              catchError(error => of(invitationsActions.getInvitationsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private liveDataService: LiveDataService
  ) {
  }
}
