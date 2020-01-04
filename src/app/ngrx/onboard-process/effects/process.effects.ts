import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {AdminService} from '../../../services/admin.service';
import * as processActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable()
export class ProcessEffects {

  getOnboardProcess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(processActions.getOnboardProcess),
        concatMap(action => {
          return this.adminService.getOnboardProgress()
            .pipe(
              map(process => {
                return processActions.getOnboardProcessSuccess({process});
              }),
              catchError(error => of(processActions.getOnboardProcessFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateOnboardProcess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(processActions.updateOnboardProcess),
        concatMap((action: any) => {
          return this.adminService.updateOnboardProgress(action.data)
            .pipe(
              map(process => {
                return processActions.updateOnboardProcessSuccess({process: action.data});
              }),
              catchError(error => of(processActions.updateOnboardProcessFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
