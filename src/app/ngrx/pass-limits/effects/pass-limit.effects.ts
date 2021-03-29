import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as passLimitActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {LocationsService} from '../../../services/locations.service';
import {of} from 'rxjs';

@Injectable()
export class PassLimitEffects {

  getPassLimits$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passLimitActions.getPassLimits),
        concatMap((action: any) => {
          return this.locationsService.getPassLimit()
            .pipe(
              map(({pass_limits}) => {
                return passLimitActions.getPassLimitsSuccess({pass_limits});
              }),
              catchError(error => of(passLimitActions.getPassLimitsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updatePassLimit$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passLimitActions.updatePassLimit),
        map((action: any) => {
          return passLimitActions.updatePassLimitSuccess({pass_limit: action.item.data});
        }),
        catchError(error => of(passLimitActions.updatePassLimitFailure({errorMessage: error.message})))
      );
  });

  constructor(
    private actions$: Actions,
    private locationsService: LocationsService
  ) {}
}
