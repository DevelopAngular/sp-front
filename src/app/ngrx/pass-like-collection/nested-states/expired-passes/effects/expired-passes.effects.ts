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
        ofType(
          expiredPassesActions.getExpiredPasses,
          expiredPassesActions.filterExpiredPasses,
          expiredPassesActions.getMoreExpiredPasses
        ),
        switchMap((action: any) => {
          const offset = action.offset ? action.offset : null;
          return this.liveDataService.watchPastHallPasses(
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user},
            50,
            action.timeFilter,
            offset
          ).pipe(
            map((expiredPasses: HallPass[]) => {
              if (offset) {
                return expiredPassesActions.getMoreExpiredPassesSuccess({passes: expiredPasses});
              } else {
                return expiredPassesActions.getExpiredPassesSuccess({expiredPasses});
              }
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
