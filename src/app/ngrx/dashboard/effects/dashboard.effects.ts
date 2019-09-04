import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {AdminService} from '../../../services/admin.service';
import * as dashboardActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable()
export class DashboardEffects {

  getDashboardData$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(dashboardActions.getDashboardData),
        concatMap((action: any) => {
          return this.adminService.getDashboardData()
            .pipe(
              map(data => {
                return dashboardActions.getDashboardDataSuccess({data});
              }),
              catchError(error => of(dashboardActions.getDashboardDataFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
