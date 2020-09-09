import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as teachersActions from '../actions';
import {catchError, concatMap, filter, map, pluck, switchMap, take} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {LocationsService} from '../../../../../services/locations.service';
import {HttpService} from '../../../../../services/http-service';
import {User} from '../../../../../models/User';
import {getCountAccounts} from '../../count-accounts/actions';

@Injectable()
export class TeachersEffects {

  getTeachers$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.getTeachers),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              switchMap((users => {
                return forkJoin({
                  userList: of(users),
                  userLocations: this.locationService.getLocationsWithManyTeachers(users.results)
                });
              })),
              map(({userList, userLocations}: {userList: any, userLocations: any[]}) => {
                const users = userList.results.map(user => {
                  const assignedTo = userLocations.filter(loc => loc.teachers.find(teacher => teacher.id === user.id));
                  return {...user, assignedTo};
                });
                const nextUrl = userList.next ? userList.next.substring(userList.next.search('v1')) : null;
                return { users, next: nextUrl };
              }),
              map(({users, next}) => {
                return teachersActions.getTeachersSuccess({teachers: users, next});
              }),
              catchError(error => of(teachersActions.getTeachersFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMoreTeachers$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.getMoreTeachers),
        concatMap(action => {
          return this.userService.nextRequests$._profile_teacher.pipe(take(1));
        }),
        // filter(res => !!res),
        switchMap(next => this.http.get(next)
          .pipe(
            switchMap((moreTeachers: any) => {
              return forkJoin({
                users: of(moreTeachers),
                userLocations: this.locationService.getLocationsWithManyTeachers(moreTeachers.results)
              });
            }),
            map(({users, userLocations}: {users: any, userLocations: any[]}) => {
              const moreTeachers = users.results.map(user => {
                const assignedTo = userLocations.filter(loc => loc.teachers.find(teacher => teacher.id === user.id));
                return {...user, assignedTo};
              });
              const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
              return {moreTeachers, nextRequest: nextUrl};
            }),
            map(({moreTeachers, nextRequest}) => {
              return teachersActions.getMoreTeachersSuccess({moreTeachers, next: nextRequest});
            }),
            catchError(error => of(teachersActions.getMoreTeachersFailure({errorMessage: error.message})))
          )
        )
      );
  });

  postTeacher$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.postTeacher),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              map((teacher: User) => {
                return teachersActions.postTeacherSuccess({teacher});
              })
            );
        })
      );
  });

  postTeacherSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.postTeacherSuccess),
        map(() => {
          return getCountAccounts();
        })
      );
  });

  removeTeacher$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.removeTeacher),
        concatMap((action: any) => {
          return this.userService.deleteUserFromProfile(action.id, 'teacher')
            .pipe(
              map(user => {
                return teachersActions.removeTeacherSuccess({id: action.id});
              }),
              catchError(error => of(teachersActions.removeTeacherFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateTeacherActivity$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.updateTeacherActivity),
        concatMap((action: any) => {
          return this.userService.setUserActivity(action.profile.id, action.active)
            .pipe(
              map(user => {
                const profile = {
                  ...action.profile
                };
                profile.active = action.active;
                return teachersActions.updateTeacherActivitySuccess({profile});
              }),
              catchError(error => of(teachersActions.updateTeacherActivityFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateTeacherPermissions$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.updateTeacherPermissions),
        concatMap((action: any) => {
          return this.userService.createUserRoles(action.profile.id, action.permissions)
            .pipe(
              map((roles: any[]) => {
                const profile = action.profile;
                profile.roles = roles.map(role => role.codename);
                return teachersActions.updateTeacherPermissionsSuccess({profile});
              }),
              catchError(error => of(teachersActions.updateTeacherPermissionsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  addUserToTeacherProfile$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(teachersActions.addUserToTeacherProfile),
        concatMap((action: any) => {
          return this.userService.addUserToProfile(action.user.id, action.role)
            .pipe(
              switchMap(user => {
                return [
                  teachersActions.updateTeacherAccount({profile: action.user}),
                  teachersActions.addUserToTeacherProfileSuccess({teacher: action.user})
                ];
              }),
              catchError(error => of(teachersActions.addUserToTeacherProfileFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private locationService: LocationsService,
    private http: HttpService
  ) {}
}
