import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as studentsActions from '../actions';
import {catchError, concatMap, map, switchMap, take} from 'rxjs/operators';
import {User} from '../../../../../models/User';
import {of} from 'rxjs';
import {HttpService} from '../../../../../services/http-service';

@Injectable()
export class StudentsEffects {

  getStudents$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.getStudents),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              map((users: any) => {
                const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
                return studentsActions.getStudentsSuccess({students: users.results, next: nextUrl});
              }),
              catchError(error => of(studentsActions.getStudentsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMoreStudents$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.getMoreStudents),
        concatMap((action: any) => {
          return this.userService.nextRequests$._profile_student.pipe(take(1));
        }),
        switchMap(next => {
          return this.http.get(next)
            .pipe(
              map((moreStudents: any) => {
                const nextUrl = moreStudents.next ? moreStudents.next.substring(moreStudents.next.search('v1')) : null;
                return studentsActions.getMoreStudentsSuccess({moreStudents: moreStudents.results, next: nextUrl});
              }),
              catchError(error => {
                return of(studentsActions.getMoreStudentsFailure({errorMessage: error.message}));
              })
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

  updateStudentActivity$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.updateStudentActivity),
        concatMap((action: any) => {
          return this.userService.setUserActivity(action.profile.id, action.active)
            .pipe(
              map(user => {
                const profile = {
                  ...action.profile
                };
                profile.active = action.active;
                return studentsActions.updateStudentActivitySuccess({profile});
              }),
              catchError(error => of(studentsActions.updateStudentActivityFailure({errorMessage: error.message})))
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
