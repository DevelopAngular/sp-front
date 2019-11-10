import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as teachersActions from '../actions';
import {catchError, concatMap, map, pluck, switchMap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {LocationsService} from '../../../../../services/locations.service';

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
                  users: of(users),
                  userLocations: this.locationService.getLocationsWithManyTeachers(users)
                });
              })),
              map(({users, userLocations}: {users: any[], userLocations: any[]}) => {
                return users.map(user => {
                  const assignedTo = userLocations.filter(loc => loc.teachers.find(teacher => teacher.id === user.id));
                  return {...user, assignedTo};
                });
              }),
              map((users) => {
                return teachersActions.getTeachersSuccess({teachers: users});
              }),
              catchError(error => of(teachersActions.getTeachersFailure({errorMessage: error.message})))
            );
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

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private locationService: LocationsService
  ) {}
}
