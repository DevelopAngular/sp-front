import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as activePassesActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable()
export class ActivePassesEffects {

  getActivePasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(activePassesActions.getActivePasses),
        concatMap((action: any) => {
          return this.liveDataService.watchActiveHallPasses(action.sortingEvents,
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}
          ).pipe(
            map((activePasses) => {
              return activePassesActions.getActivePassesSuccess({activePasses});
            }),
            catchError(error => of(activePassesActions.getActivePassesFailure({errorMessage: error.message})))
          );
        })
      );
  });

  updateActivePasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(activePassesActions.updateActivePasses),
        concatMap((action: any) => {
          return this.liveDataService.watchActiveHallPasses(action.sortingEvents,
            action.user.roles.includes('hallpass_student')
              ? {type: 'student', value: action.user}
              : {type: 'issuer', value: action.user}
          ).pipe(
            map((activePasses) => {
              return activePassesActions.getActivePassesSuccess({activePasses});
            }),
            catchError(error => of(activePassesActions.getActivePassesFailure({errorMessage: error.message})))
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
