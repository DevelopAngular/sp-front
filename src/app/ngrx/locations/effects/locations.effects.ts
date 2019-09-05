import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {LocationsService} from '../../../services/locations.service';
import * as locsActions from '../actions';
import {catchError, concatMap, map, mapTo} from 'rxjs/operators';
import {Location} from '../../../models/Location';
import {of} from 'rxjs';

@Injectable()
export class LocationsEffects {

  getLocationsWithTeachers$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(locsActions.getLocsWithTeachers),
        concatMap((action: any) => {
          return this.locationService.getLocationsWithManyTeachers(action.teachers)
            .pipe(
              map((locations: Location[]) => {
                return locsActions.getLocsWithTeachersSuccess({locs: locations});
              }),
              catchError(error => of(locsActions.getLocsWithTeachersFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private locationService: LocationsService
  ) {}
}