import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as fromLocationActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';

@Injectable()
export class FromLocationPassesEffects {

  getFromLocationPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(fromLocationActions.getFromLocationPasses),
        concatMap((action: any) => {
          return this.liveDataService.watchHallPassesFromLocation(action.sortingEvents, action.filter, action.date)
            .pipe(
              map((fromLocationPasses: HallPass[]) => {
                return fromLocationActions.getFromLocationPassesSuccess({fromLocationPasses});
              }),
              catchError(error => of(fromLocationActions.getFromLocationPassesFailure({errorMessage: error.message})))
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
