import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LocationsService } from '../../../services/locations.service';
import * as favLocActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Location } from '../../../models/Location';

@Injectable()
export class FavoriteLocationsEffects {

  getFavoriteLocations$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(favLocActions.getFavoriteLocations),
        concatMap(action => {
          return this.locService.getFavoriteLocations()
            .pipe(
              map((locations: Location[]) => {
                return favLocActions.getFavoriteLocationsSuccess({locations});
              }),
              catchError(error => of(favLocActions.getFavoriteLocationsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private locService: LocationsService
    ) {}
}
