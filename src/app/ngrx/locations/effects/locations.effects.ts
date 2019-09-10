import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LocationsService } from '../../../services/locations.service';
import { catchError, concatMap, map } from 'rxjs/operators';
import * as locationsActions from '../actions';
import { of } from 'rxjs';

@Injectable()
export class LocationsEffects {

  getLocations$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.getLocations),
        concatMap((action: any) => {
          return this.locService.getLocationsWithConfig(action.url)
            .pipe(
              map((locations: any) => {
                return locationsActions.getLocationsSuccess({locations: locations.results});
              }),
              catchError(error => of(locationsActions.getLocationsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  searchLocations$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.searchLocations),
        concatMap((action: any) => {
          return this.locService.getLocationsWithConfig(action.url)
            .pipe(
              map((foundLocations: any) => {
                return locationsActions.searchLocationsSuccess({foundLocations: foundLocations.results});
              }),
              catchError(error => of(locationsActions.searchLocationsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private locService: LocationsService
  ) {}
}
