import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LiveDataService} from '../../../../../live-data/live-data.service';
import * as hallMonitorActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HallPass} from '../../../../../models/HallPass';
import {of} from 'rxjs';

@Injectable()
export class HallMonitorPassesEffects {

  getHallMonitorPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(hallMonitorActions.getHallMonitorPasses),
        switchMap((action: any) => {
          return this.liveDataService.watchActiveHallPasses(action.sortingEvents, action.filter, action.date)
            .pipe(
              map((hallMonitorPasses: HallPass[]) => {
                return hallMonitorActions.getHallMonitorPassesSuccess({hallMonitorPasses});
              }),
              catchError(error => of(hallMonitorActions.getHallMonitorPassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateHallMonitorPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(hallMonitorActions.updateHallMonitorPasses),
        switchMap((action: any) => {
          return this.liveDataService.watchActiveHallPasses(action.sortingEvents)
            .pipe(
              map((hallMonitorPasses: HallPass[]) => {
                return hallMonitorActions.updateHallMonitorPassesSuccess({hallMonitorPasses});
              }),
              catchError(error => of(hallMonitorActions.updateHallMonitorPassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private liveDataService: LiveDataService
  ) {}
}
