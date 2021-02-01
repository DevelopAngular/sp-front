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
        ofType(expiredPassesActions.getExpiredPasses),
        switchMap((action: any) => {
          return this.liveDataService.watchPastHallPasses(
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}, 50
          ).pipe(
            map((expiredPasses: HallPass[]) => {
              console.log('TTTTTT ===>>', expiredPasses.length);
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
          return this.passesService.getMoreExpiredPasses(action.timeFilter)
            .pipe(
              map(({next, results}: {next: string, results: HallPass[]}) => {
                this.passesService.expiredPassesNextUrl$.next(next ? next.substring(next.search('v1')) : '');
                return expiredPassesActions.getMoreExpiredPassesSuccess({passes: results});
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
