import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as expiredPassesActions from '../actions';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';
import {HallPassesService} from '../../../../../services/hall-passes.service';

@Injectable()
export class ExpiredPassesEffects {

  getExpiredPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(
          expiredPassesActions.getExpiredPasses,
          expiredPassesActions.filterExpiredPasses
        ),
        switchMap((action: any) => {
          return this.liveDataService.watchPastHallPasses(
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}, 50, action.timeFilter
          ).pipe(
            map((expiredPasses: HallPass[]) => {
              return expiredPassesActions.getExpiredPassesSuccess({expiredPasses});
            }),
            catchError(error => of(expiredPassesActions.getExpiredPassesFailure({errorMessage: error.message})))
          );
        })
      );
  });

  getMoreExpiredPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(expiredPassesActions.getMoreExpiredPasses),
        switchMap((action: any) => {
          const offset = action.offset ? action.offset : null;
          return this.liveDataService.watchPastHallPasses(
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}, 50, action.timeFilter, offset
          ).pipe(
              map((passes: HallPass[]) => {
                return expiredPassesActions.getMoreExpiredPassesSuccess({passes});
              }),
              catchError(error => of(expiredPassesActions.getMoreExpiredPassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  // filterExpiredPasses$ = createEffect(() => {
  //   return this.actions$
  //     .pipe(
  //       ofType(expiredPassesActions.filterExpiredPasses),
  //       switchMap((action: any) => {
  //         return this.passesService.getMoreExpiredPasses()
  //           .pipe(
  //             map((expiredPasses: HallPass[]) => {
  //               return expiredPassesActions.filterExpiredPassesSuccess({expiredPasses});
  //             }),
  //             catchError(error => of(expiredPassesActions.getMoreExpiredPassesFailure({errorMessage: error.message})))
  //           );
  //       })
  //     );
  // });

  constructor(
    private actions$: Actions,
    private liveDataService: LiveDataService,
    private passesService: HallPassesService
  ) {
  }
}
