import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpService } from '../../../services/http-service';
import * as schoolsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { School } from '../../../models/School';
import { of } from 'rxjs';
import {AdminService} from '../../../services/admin.service';

@Injectable()
export class SchoolsEffects {

  getSchools$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(schoolsActions.getSchools),
      concatMap(action => {
        return this.http.getSchools()
          .pipe(
            map((schools: School[]) => {
              return schoolsActions.getSchoolsSuccess({schools});
            }),
            catchError(error => of(schoolsActions.getSchoolsFailure({errorMessage: error.message})))
          );
      })
    );
  });

  patchSchool$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.updateSchool),
        concatMap((action: any) => {
          return this.adminService.updateSchoolSettings(action.school.id, action.fields)
            .pipe(
              map((school: any) => {
                const updatedSchool = {
                  ...action.school,
                  ...action.fields
                };
                return schoolsActions.updateSchoolSuccess({school: updatedSchool});
              }),
              catchError(error => of(schoolsActions.updateSchoolFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private http: HttpService,
    private adminService: AdminService
  ) {}
}
