import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as teachersActions from '../actions';
import {catchError, concatMap, map, switchMap} from 'rxjs/operators';
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

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private locationService: LocationsService
  ) {}
}
