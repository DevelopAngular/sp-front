import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as filterActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {HallPassesService} from '../../../services/hall-passes.service';
import {PassFilters} from '../../../models/PassFilters';
import {of} from 'rxjs';

@Injectable()
export class FiltersEffects {

  getFilters$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(filterActions.getPassFilter),
        concatMap((action: any) => {
          return this.passesService.getFilters(action.model)
            .pipe(
              map((filterData: PassFilters) => {
                return filterActions.getPassFilterSuccess({model: action.model, filterData});
              }),
              catchError(error => of(filterActions.getPassFilterFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateFilters$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(filterActions.updatePassFilter),
        concatMap((action: any) => {
          return this.passesService.updateFilter(action.model, action.value)
            .pipe(
              map((filterData: PassFilters) => {
                return filterActions.updatePassFilterSuccess({model: action.model, filterData});
              }),
              catchError(error => of(filterActions.updatePassFilterFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private passesService: HallPassesService
  ) {}
}
