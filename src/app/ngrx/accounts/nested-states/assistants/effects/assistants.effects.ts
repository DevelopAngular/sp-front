import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as assistantsActions from '../actions';
import {catchError, concatMap, map, switchMap } from 'rxjs/operators';
import {forkJoin, of, zip} from 'rxjs';

@Injectable()
export class AssistantsEffects {
  getAssistants$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.getAssistants),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              switchMap((userlist: any[]) => {
                if (!userlist.length) {
                  return of({
                    users: [],
                    representedUsers: []
                  });
                }
                return forkJoin({
                  users: of(userlist),
                  representedUsers: zip(...userlist.map(user => this.userService.getRepresentedUsers(user.id)))

                });
              }),
              map(({users, representedUsers}) => {
                if (!users.length) {
                  return [];
                }
                return users.map((user, index) => {
                  return {
                    ...user,
                    canActingOnBehalfOf: representedUsers[index]
                  };
                });
              }),
              map((users) => {
                return assistantsActions.getAssistantsSuccess({assistants: users});
              }),
              catchError(error => of(assistantsActions.getAssistantsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeAssistant$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.removeAssistant),
        concatMap((action: any) => {
          return this.userService.deleteUserFromProfile(action.id, 'assistant')
            .pipe(
              map(user => {
                return assistantsActions.removeAssistantSuccess({id: action.id});
              }),
              catchError(error => of(assistantsActions.removeAssistantFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateAssistantActivity$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.updateAssistantActivity),
        concatMap((action: any) => {
          return this.userService.setUserActivity(action.profile.id, action.active)
            .pipe(
              map(user => {
                const profile = {
                  ...action.profile
                };
                profile.active = action.active;
                return assistantsActions.updateAssistantActivitySuccess({profile});
              }),
              catchError(error => of(assistantsActions.updateAssistantActivityFailure({errorMessage: error.message})))
            );
        })
      );
  });

  addRepresentedUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.addRepresentedUserAction),
        concatMap((action: any) => {
          return this.userService.addRepresentedUser(action.profile.id, action.user)
            .pipe(
              map((user: any) => {
                action.profile._originalUserProfile.canActingOnBehalfOf.push({
                  roles: [...action.user.roles],
                  user: action.user
                });
                return assistantsActions.addRepresentedUserSuccess({profile: action.profile});
              }),
              catchError(error => of(assistantsActions.addRepresentedUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeRepresentedUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.removeRepresentedUserAction),
        concatMap((action: any) => {
          return this.userService.deleteRepresentedUser(action.profile.id, action.user)
            .pipe(
              map(user => {
                const index = action.profile._originalUserProfile.canActingOnBehalfOf.findIndex(elem => {
                  return elem.user.id === action.user.id;
                });
                action.profile._originalUserProfile.canActingOnBehalfOf.splice(index, 1);
                return assistantsActions.removeRepresentedUserSuccess({profile: action.profile});
              }),
              catchError(error => of(assistantsActions.removeRepresentedUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateAssistantPermissions$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.updateAssistantPermissions),
        concatMap((action: any) => {
          return this.userService.createUserRoles(action.profile.id, action.permissions)
            .pipe(
              map((roles: any) => {
                const profile = action.profile;
                profile.roles = roles.map(role => role.codename);
                return assistantsActions.updateAssistantPermissionsSuccess({profile});
              }),
              catchError(error => of(assistantsActions.updateAssistantPermissionsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
