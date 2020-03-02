import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as allAccountsActions from '../actions';
import {catchError, concatMap, map, switchMap, take} from 'rxjs/operators';
import {UserService} from '../../../../../services/user.service';
import {of} from 'rxjs';
import {HttpService} from '../../../../../services/http-service';

@Injectable()
export class AllAccountsEffects {

  getAllAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(allAccountsActions.getAllAccounts),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: any) => {
                const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
                return allAccountsActions.getAllAccountsSuccess({accounts: users.results, next: nextUrl});
              }),
              catchError(error => of(allAccountsActions.getAllAccountsFailure({ errorMessage: error.message })))
            );
        })
      );
  });

  getMoreAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(allAccountsActions.getMoreAccounts),
        concatMap((action: any) => {
          return this.userService.nextRequests$._all.pipe(take(1));
        }),
        switchMap(next => this.http.get(next)),
        map((moreAccounts: any) => {
          const nextUrl = moreAccounts.next ? moreAccounts.next.substring(moreAccounts.next.search('v1')) : null;
          return allAccountsActions.getMoreAccountsSuccess({moreAccounts: moreAccounts.results, next: nextUrl});
        }),
        catchError(error => of(allAccountsActions.getMoreAccountsFailure({errorMessage: error.message})))
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
    private userService: UserService,
    private http: HttpService
  ) {}
}
