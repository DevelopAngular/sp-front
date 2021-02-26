import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as assistantsActions from '../actions';
import {catchError, concatMap, exhaustMap, map, switchMap, take} from 'rxjs/operators';
import {forkJoin, of, zip} from 'rxjs';
import {HttpService} from '../../../../../services/http-service';
import {User} from '../../../../../models/User';
import {getCountAccounts} from '../../count-accounts/actions';

@Injectable()
export class AssistantsEffects {
  getAssistants$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.getAssistants),
        exhaustMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              switchMap((userlist: any) => {
                if (!userlist.results.length) {
                  return of({
                    users: {results: []},
                    representedUsers: []
                  });
                }
                return forkJoin({
                  users: of(userlist),
                  representedUsers: zip(...userlist.results.map(user => this.userService.getRepresentedUsers(user.id)))

                });
              }),
              map(({users, representedUsers}) => {
                if (!users.results.length) {
                  return {moreAssistants: [], next: null};
                }
                const moreAssistants = users.results.map((user, index) => {
                  return {
                    ...user,
                    canActingOnBehalfOf: representedUsers[index]
                  };
                });
                const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
                return {moreAssistants, next: nextUrl};
              }),
              map(({moreAssistants, next}) => {
                return assistantsActions.getAssistantsSuccess({assistants: moreAssistants, next});
              }),
              catchError(error => of(assistantsActions.getAssistantsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMoreAssistants$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.getMoreAssistants),
        concatMap(action => {
          return this.userService.nextRequests$._profile_assistant.pipe(take(1));
        }),
        switchMap(next => {
          return this.http.get(next)
              .pipe(
                switchMap((userlist: any) => {
                  if (!userlist.results.length) {
                    return of({
                      users: [],
                      representedUsers: []
                    });
                  }
                  return forkJoin({
                    users: of(userlist),
                    representedUsers: zip(...userlist.results.map(user => this.userService.getRepresentedUsers(user.id)))

                  });
                }),
                map(({users, representedUsers}) => {
                  if (!users.results.length) {
                    return {moreAssistants: [], next: null};
                  }
                  const moreAssistants = users.results.map((user, index) => {
                    return {
                      ...user,
                      canActingOnBehalfOf: representedUsers[index]
                    };
                  });
                  const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
                  return {moreAssistants, nextUrl};
                }),
                map(({moreAssistants, nextUrl}) => {
                  return assistantsActions.getMoreAssistantsSuccess({assistants: moreAssistants, next: nextUrl});
                }),
                catchError(error => of(assistantsActions.getMoreAssistantsFailure({errorMessage: error.message})))
              );
          }
        )
      );
  });

  postAssistant$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.postAssistant),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              switchMap((user: User) => {
                return forkJoin({
                  user: of(user),
                  representedUsers: zip(...action.behalf.map((teacher: User) => {
                      return this.userService.addRepresentedUser(+user.id, teacher);
                    }))
                }
                );
              }),
              map(({user, representedUsers}) => {
                const assistant = {
                  ...user,
                  canActingOnBehalfOf: representedUsers.map((u: any) => {
                    return { user: u.represented_user, roles: u.roles };
                  })
                };
                return assistantsActions.postAssistantSuccess({assistant});
              })
            );
        })
      );
  });

  postAssistantSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.postAssistantSuccess),
        map(() => {
          return getCountAccounts();
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

  addUserToAssistantProfile$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.addUserToAssistantProfile),
        concatMap((action: any) => {
          return this.userService.addUserToProfile(action.user.id, action.role)
            .pipe(
              switchMap((user: User) => {
                return [
                  assistantsActions.updateAssistantAccount({profile: user}),
                  assistantsActions.addUserToAssistantProfileSuccess({assistant: user})
                ];
              }),
              catchError(error => of(assistantsActions.addUserToAssistantProfileFailure({errorMessage: error.message})))
            );
        })
      );
  });

  sortAssistantAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.sortAssistantAccounts),
        concatMap((action: any) => {
          return forkJoin({
            users: of(action.assistants),
            representedUsers: zip(...action.assistants.map(user => this.userService.getRepresentedUsers(user.id)))
          }).pipe(
              map(({users, representedUsers}) => {
                const assistants = users.map((user, index) => {
                  return {
                    ...user,
                    canActingOnBehalfOf: representedUsers[index]
                  };
                });
                return assistantsActions.sortAssistantAccountsSuccess({assistants, next: action.next, sortValue: action.sortValue})
              })
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
