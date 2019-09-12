import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as studentsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {User} from '../../../../../models/User';
import {of} from 'rxjs';

@Injectable()
export class StudentsEffects {

  getStudents$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.getStudents),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: User[]) => {
                return studentsActions.getStudentsSuccess({students: users});
              }),
              catchError(error => of(studentsActions.getStudentsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeStudent$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.removeStudent),
        concatMap((action: any) => {
          return this.userService.deleteUserFromProfile(action.id, 'student')
            .pipe(
              map(user => {
                return studentsActions.removeStudentSuccess({id: action.id});
              }),
              catchError(error => of(studentsActions.removeStudentFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
