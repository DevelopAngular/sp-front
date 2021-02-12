import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as rUsersActions from '../actions';
import {catchError, exhaustMap, map} from 'rxjs/operators';
import {RepresentedUser} from '../../../navbar/navbar.component';
import {of} from 'rxjs';
import {User} from '../../../models/User';

@Injectable()
export class RepresentedUsersEffects {

  getRUsers$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(rUsersActions.getRUsers),
        exhaustMap((action: any) => {
          return this.userService.getUserRepresented()
            .pipe(
              map((rUsers: RepresentedUser[]) => {
                const users = rUsers.map(rUser => ({...rUser, user: User.fromJSON(rUser.user)}));
                return rUsersActions.getRUsersSuccess({rUsers: users});
              }),
              catchError(error => of(rUsersActions.getRUsersFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {
  }
}
