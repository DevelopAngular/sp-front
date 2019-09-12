import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {AdminService} from '../../../services/admin.service';
import {catchError, concatMap, map} from 'rxjs/operators';
import {ColorProfile} from '../../../models/ColorProfile';
import * as colorsActions from '../actions';
import {of} from 'rxjs';

@Injectable()
export class ColorsEffects {

  getColors$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(colorsActions.getColorProfiles),
        concatMap(action => {
          return this.adminService.getColors()
            .pipe(
              map((colors: ColorProfile[]) => {
                return colorsActions.getColorProfilesSuccess({colors});
              }),
              catchError(error => of(colorsActions.getColorProfilesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
