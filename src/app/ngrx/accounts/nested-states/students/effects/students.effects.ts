import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as studentsActions from '../actions';
import {catchError, concatMap, exhaustMap, map, switchMap, take} from 'rxjs/operators';
import {User} from '../../../../../models/User';
import {of} from 'rxjs';
import {HttpService} from '../../../../../services/http-service';
import {getCountAccounts} from '../../count-accounts/actions';
import {UserStats} from '../../../../../models/UserStats';
import {HallPass} from '../../../../../models/HallPass';

@Injectable()
export class StudentsEffects {

  getStudents$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.getStudents),
        exhaustMap((action: any) => {
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
        // filter(res => !!res),
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

  postStudent$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.postStudent),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              map((student: User) => {
                return studentsActions.postStudentSuccess({student});
              })
            );
        })
      );
  });

  postStudentSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.postStudentSuccess),
        map(() => {
          return getCountAccounts();
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

  addUserToStudentProfile$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(studentsActions.addUserToStudentProfile),
        concatMap((action: any) => {
          return this.userService.addUserToProfile(action.user.id, action.role)
            .pipe(
              map(user => {
                return studentsActions.addUserToStudentProfileSuccess({student: action.user});
              }),
              catchError(error => of(studentsActions.addUserToStudentProfileFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getStudentStats$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(studentsActions.getStudentStats),
      switchMap((action) => {
        return this.userService.getUserStats(action.userId, action.queryParams)
          .pipe(
            map((stats: UserStats) => {
              return studentsActions.getStudentStatsSuccess({userId: action.userId,
                stats: {...stats, expired_passes: stats.expired_passes.map(pass => HallPass.fromJSON(pass))}
              });
            }),
            catchError(error => of(studentsActions.getStudentStatsFailure({errorMessage: error.message})))
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
