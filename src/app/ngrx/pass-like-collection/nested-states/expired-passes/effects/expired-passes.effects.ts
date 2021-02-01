import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as expiredPassesActions from '../actions';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';

@Injectable()
export class ExpiredPassesEffects {

  getExpiredPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(expiredPassesActions.getExpiredPasses),
        switchMap((action: any) => {
          return this.liveDataService.watchPastHallPasses(
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}
          ).pipe(
            map((expiredPasses: HallPass[]) => {
              return expiredPassesActions.getExpiredPassesSuccess({expiredPasses});
            }),
            catchError(error => of(expiredPassesActions.getExpiredPassesFailure({errorMessage: error.message})))
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
