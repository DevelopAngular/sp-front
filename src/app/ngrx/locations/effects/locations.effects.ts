import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LocationsService} from '../../../services/locations.service';
import {catchError, concatMap, exhaustMap, filter, map, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {Location} from '../../../models/Location';
import {HallPassesService} from '../../../services/hall-passes.service';
import * as locationsActions from '../actions';
import * as pinnablesActions from '../../pinnables/actions';
import {Pinnable} from '../../../models/Pinnable';

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

  getLocationsFromCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(locationsActions.getLocationsFromCategory),
      concatMap((action: any) => {
        return this.locService.getLocationsWithConfig(action.url)
          .pipe(
            map((locations: any) => {
              return locationsActions.getLocationsFromCategorySuccess({locations: locations.results});
            }),
            catchError(error => of(locationsActions.getLocationsFromCategoryFailure({errorMessage: error.message})))
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

  updateLocationSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locationsActions.updateLocationSuccess),
        exhaustMap((action: any) => {
          return this.passesService.pinnables$.pipe(
            take(1),
            map((pinnables) => pinnables.find(p => p.location.id === action.location.id)),
            filter((pinnable) => !!pinnable),
            map((pinnable: Pinnable) => {
              const updatedPinnable = {
                ...pinnable,
                location: action.location
              };
              return pinnablesActions.updatePinnableSuccess({pinnable: updatedPinnable as Pinnable});
            })
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
    private locService: LocationsService,
    private passesService: HallPassesService
  ) {}
}
