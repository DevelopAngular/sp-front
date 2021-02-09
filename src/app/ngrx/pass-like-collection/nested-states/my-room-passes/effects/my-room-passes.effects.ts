import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as myRoomPassesActions from '../actions';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';

@Injectable()
export class MyRoomPassesEffects {

  getMyRoomPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(myRoomPassesActions.getMyRoomPasses),
        switchMap((action: any) => {
          return this.liveDataService.watchActiveHallPasses(action.sortingEvents, action.filter, action.date)
            .pipe(
              map((myRoomPasses: HallPass[]) => {
                return myRoomPassesActions.getMyRoomPassesSuccess({myRoomPasses});
              }),
              catchError(error => of(myRoomPassesActions.getMyRoomPassesFailure({errorMessage: error.message})))
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
