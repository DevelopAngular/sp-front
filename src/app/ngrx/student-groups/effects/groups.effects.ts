import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as groupsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {StudentList} from '../../../models/StudentList';
import {of} from 'rxjs';


@Injectable()
export class StudentGroupsEffects {

  getStudentsGroups$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(groupsActions.getStudentGroups),
        concatMap(action => {
          return this.userService.getStudentGroups()
            .pipe(
              map((groups: StudentList[]) => {
                return groupsActions.getStudentGroupsSuccess({groups});
              }),
              catchError(error => of(groupsActions.getStudentsGroupsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  postStudentGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(groupsActions.postStudentGroup),
        concatMap((action: any) => {
          return this.userService.createStudentGroup(action.group)
            .pipe(
              map((group: StudentList) => {
                return groupsActions.postStudentGroupSuccess({group: group});
              }),
              catchError(error => of(groupsActions.postStudentGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateStudentGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(groupsActions.updateStudentGroup),
        concatMap((action: any) => {
          return this.userService.updateStudentGroup(action.id, action.group)
            .pipe(
              map((group: any) => {
                return groupsActions.updateStudentGroupSuccess({group});
              }),
              catchError(error => of(groupsActions.updateStudentGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeStudentGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(groupsActions.removeStudentGroup),
        concatMap((action: any) => {
          return this.userService.deleteStudentGroup(action.id)
            .pipe(
              map(group => {
                return groupsActions.removeStudentGroupSuccess({id: action.id});
              }),
              catchError(error => of(groupsActions.removeStudentsGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
    ) {}
}
