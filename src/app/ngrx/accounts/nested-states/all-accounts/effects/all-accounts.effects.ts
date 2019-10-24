import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as allAccountsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import {UserService} from '../../../../../services/user.service';
import {User} from '../../../../../models/User';
import {of} from 'rxjs';

@Injectable()
export class AllAccountsEffects {

  getAllAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(allAccountsActions.getAllAccounts),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: User[]) => {
                return allAccountsActions.getAllAccountsSuccess({accounts: users});
              }),
              catchError(error => of(allAccountsActions.getAllAccountsFailure({ errorMessage: error.message })))
            );
        })
      );
  });

  removeAllAccount$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(allAccountsActions.removeAllAccount),
        concatMap((action: any) => {
          return this.userService.deleteUser(action.id)
            .pipe(
              map(user => {
                return allAccountsActions.removeAllAccountSuccess({id: action.id});
              }),
              catchError(error => of(allAccountsActions.removeAllAccountFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
