import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as requestsActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Request} from '../../../../../models/Request';
import {of} from 'rxjs';

@Injectable()
export class RequestsEffects {

  getRequests$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(requestsActions.getRequests),
        switchMap((action: any) => {
          return this.livDataService.watchInboxRequests(action.user)
            .pipe(
              map((requests: Request[]) => {
                return requestsActions.getRequestsSuccess({requests});
              }),
              catchError(error => of(requestsActions.getRequestsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private livDataService: LiveDataService
  ) {
  }
}
