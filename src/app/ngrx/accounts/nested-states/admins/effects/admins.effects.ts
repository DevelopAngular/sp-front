import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as adminsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {UserService} from '../../../../../services/user.service';
import {of} from 'rxjs';

@Injectable()
export class AdminsEffects {
  getAdmins$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.getAdmins),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: any) => {
                return adminsActions.getAdminsSuccess({admins: users});
              }),
              catchError(error => of(adminsActions.getAdminsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeAdmin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.removeAdminAccount),
        concatMap((action) => {
          return this.userService.deleteUserFromProfile(action.id, 'admin')
            .pipe(
              map(user => {
                return adminsActions.removeAdminAccountSuccess({id: action.id});
              }),
              catchError(error => of(adminsActions.removeAdminAccountFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateAdminActivity$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.updateAdminActivity),
        concatMap((action: any) => {
          return this.userService.setUserActivity(action.profile.id, action.active)
            .pipe(
              map(user => {
                const profile = {
                  ...action.profile
                };
                profile.active = action.active;
                return adminsActions.updateAdminActivitySuccess({profile});
              }),
              catchError(error => of(adminsActions.updateAdminActivityFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(private actions$: Actions, private userService: UserService) {}
}
