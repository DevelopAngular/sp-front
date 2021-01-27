import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as toLocationActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';

@Injectable()
export class ToLocationPassesEffects {

  getToLocationPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(toLocationActions.getToLocationPasses),
        concatMap((action: any) => {
          return this.liveDataService.watchHallPassesToLocation(action.sortingEvents, action.filter, action.date)
            .pipe(
              map((toLocationPasses: HallPass[]) => {
                return toLocationActions.getToLocationPassesSuccess({toLocationPasses});
              }),
              catchError(error => of(toLocationActions.getToLocationPassesFailure({errorMessage: error.message})))
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
