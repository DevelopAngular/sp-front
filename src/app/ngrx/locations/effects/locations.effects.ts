import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LocationsService } from '../../../services/locations.service';
import {catchError, concatMap, map, switchMap} from 'rxjs/operators';
import * as locationsActions from '../actions';
import { of } from 'rxjs';
import {Location} from '../../../models/Location';

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

  postLocation$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.postLocation),
        concatMap((action: any) => {
          return this.locService.createLocation(action.data)
            .pipe(
              switchMap((location: Location) => {
                return this.locService.updateLocation(location.id, action.data);
              }),
              map((location: Location) => {
                return locationsActions.postLocationSuccess({location});
              }),
              catchError(error => of(locationsActions.postLocationFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateLocation$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.updateLocation),
        concatMap((action: any) => {
          return this.locService.updateLocation(action.id, action.data)
            .pipe(
              map((location: Location) => {
                return locationsActions.updateLocationSuccess({location});
              }),
              catchError(error => of(locationsActions.updateLocationFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeLocation$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.removeLocation),
        concatMap((action: any) => {
          return this.locService.deleteLocation(action.id)
            .pipe(
              map(loc => {
                return locationsActions.removeLocationSuccess({id: action.id});
              }),
              catchError(error => of(locationsActions.removeLocationFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private locService: LocationsService
  ) {}
}
