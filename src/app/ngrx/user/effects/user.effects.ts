import {Injectable} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as userActions from '../actions';
import * as accountsActions from '../../accounts/actions/accounts.actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {User} from '../../../models/User';
import {of} from 'rxjs';

@Injectable()
export class UserEffects {

  getUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.getUser),
        concatMap(action => {
          return this.userService.getUser()
            .pipe(
              map((user: User) => {
                return userActions.getUserSuccess({user});
              }),
              catchError(error => of(userActions.getUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getUserPin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.getUserPinAction),
        concatMap(action => {
          return this.userService.getUserPin()
            .pipe(
              map(({pin}) => {
                return userActions.getUserPinSuccess({pin});
              }),
              catchError(error => of(userActions.getUserPinFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserAction),
        concatMap((action: any) => {
          return this.userService.updateUser(action.user.id, action.data)
            .pipe(
              map((user: User) => {
                if (action.data.pin) {
                  return userActions.updateUserPin({pin: action.data.pin});
                }
                return userActions.updateUserSuccess({user});
              }),
              catchError(error => of(userActions.updateUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateUserSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserSuccess),
        map((action: any) => {
          return accountsActions.updateAccounts({account: action.user});
        })
      );
  });

  updateUserPin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserPin),
        map((action) => {
          return userActions.updateUserPinSuccess({pin: action.pin});
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
