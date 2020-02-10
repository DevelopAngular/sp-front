import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {HttpService} from '../../../services/http-service';
import * as schoolsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { School } from '../../../models/School';
import { of } from 'rxjs';
import {AdminService} from '../../../services/admin.service';
import {GoogleLoginService} from '../../../services/google-login.service';
import {environment} from '../../../../environments/environment';
import {Router} from '@angular/router';

declare const window;

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
            catchError(error => {
              return of(schoolsActions.getSchoolsFailure({errorMessage: error.message}));
            })
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

  showErrorToast$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getSchoolsFailure, schoolsActions.getSchoolsFailure),
        map((action: any) => {
          window.appLoaded();
          this.http.errorToast$.next({
            header: 'Oops! Sign in error',
            message: 'School has not been yet launched'
          });
          setTimeout(() => {
            this.router.navigate(['sign-out']);
          }, 2500);
          return schoolsActions.errorToastSuccess();
        })
      );
  });

  constructor(
    private actions$: Actions,
    private http: HttpService,
    private adminService: AdminService,
    private router: Router
  ) {}
}
