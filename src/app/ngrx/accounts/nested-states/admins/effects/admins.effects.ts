import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as adminsActions from '../actions';
import {catchError, concatMap, exhaustMap, map, mapTo, switchMap, take} from 'rxjs/operators';
import {UserService} from '../../../../../services/user.service';
import {of, zip} from 'rxjs';
import {HttpService} from '../../../../../services/http-service';
import {User} from '../../../../../models/User';
import {getCountAccounts} from '../../count-accounts/actions';

@Injectable()
export class AdminsEffects {
  getAdmins$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.getAdmins),
        exhaustMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: any) => {
                const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
                return adminsActions.getAdminsSuccess({admins: users.results, next: nextUrl});
              }),
              catchError(error => of(adminsActions.getAdminsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMoreAdmins$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.getMoreAdmins),
        concatMap(action => {
          return this.userService.nextRequests$._profile_admin.pipe(take(1));
        }),
        // filter(res => !!res),
        switchMap(next => this.http.get(next)
          .pipe(
            map((users: any) => {
              const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
              return adminsActions.getMoreAdminsSuccess({admins: users.results, next: nextUrl});
            }),
            catchError(error => of(adminsActions.getMoreAdminsFailure({errorMessage: error.message})))
          )
        )
      );
  });

  postAdmin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.postAdmin),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              switchMap((admin: User) => {
                if (action.behalf) {
                  return zip(...action.behalf.map(user => this.userService.addRepresentedUser(+admin.id, user))).pipe(mapTo(admin))
                } else {
                  return of(admin);
                }
              }),
              map((admin: User) => {
                return adminsActions.postAdminSuccess({admin});
              })
            );
        })
      );
  });

  postAdminSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.postAdminSuccess),
        map(() => {
          return getCountAccounts();
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

  updateAdminPermissions$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.updateAdminPermissions),
        concatMap((action: any) => {
          return this.userService.createUserRoles(action.profile.id, action.permissions)
            .pipe(
              map((roles: any) => {
                const profile = action.profile;
                profile.roles = roles.map(role => role.codename);
                return adminsActions.updateAdminPermissionsSuccess({profile});
              }),
              catchError(error => of(adminsActions.updateAdminPermissionsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  addUserToAdminProfile$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(adminsActions.addUserToAdminProfile),
        concatMap((action: any) => {
          return this.userService.addUserToProfile(action.user.id, action.role)
            .pipe(
              switchMap((user: User) => {
                return [
                  adminsActions.updateAdminAccount({profile: user}),
                  adminsActions.addUserToAdminProfileSuccess({admin: user})
                ];
              }),
              catchError(error => of(adminsActions.addUserToAdminProfileFailure({errorMessage: error.message})))
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
