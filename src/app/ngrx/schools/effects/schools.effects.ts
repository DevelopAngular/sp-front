import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {HttpService} from '../../../services/http-service';
import * as schoolsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { School } from '../../../models/School';
import { of } from 'rxjs';
import {AdminService} from '../../../services/admin.service';
import {GoogleLoginService} from '../../../services/google-login.service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {StorageService} from '../../../services/storage.service';

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
              window.waitForAppLoaded(true);
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
        ofType(schoolsActions.getSchoolsFailure),
        map((action: any) => {
          window.appLoaded();
          this.http.errorToast$.next({
            header: 'Oops! Sign in error',
            message: 'School has not been yet launched'
          });
          this.http.clearInternal();
          this.loginService.clearInternal(true);
          this.http.setSchool(null);
          this.userService.clearUser();
          this.userService.userData.next(null);
          return schoolsActions.errorToastSuccess();
        })
      );
  });

  constructor(
    private actions$: Actions,
    private http: HttpService,
    private adminService: AdminService,
    private router: Router,
    private userService: UserService,
    private loginService: GoogleLoginService,
    private storage: StorageService
  ) {}
}
