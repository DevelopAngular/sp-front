import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {HallPassesService} from '../../../services/hall-passes.service';
import * as statsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable()
export class PassStatsEffects {

  getPassStates$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(statsActions.getPassStats),
        concatMap(action => {
          return this.passesService.getPassStats()
            .pipe(
              map(data => {
                return statsActions.getPassStatsSuccess({data});
              }),
              catchError(error => of(statsActions.getPassStatsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private passesService: HallPassesService
  ) {}
}
