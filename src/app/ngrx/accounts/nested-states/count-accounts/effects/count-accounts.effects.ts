import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as countActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {AdminService} from '../../../../../services/admin.service';
import {of} from 'rxjs';


@Injectable()
export class CountAccountsEffects {

  getCountAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(countActions.getCountAccounts),
        concatMap((action) => {
          return this.adminService.getAdminAccounts()
            .pipe(
              map(count => {
                return countActions.getCountAccountsSuccess({countData: count});
              }),
              catchError(error => of(countActions.getCountAccountsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
