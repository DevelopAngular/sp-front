import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {HttpService} from '../../../services/http-service';
import * as schoolsActions from '../actions';
import {catchError, concatMap, exhaustMap, map, switchMap} from 'rxjs/operators';
import {School} from '../../../models/School';
import {of} from 'rxjs';
import {AdminService} from '../../../services/admin.service';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {GoogleLoginService} from '../../../services/google-login.service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {CleverInfo} from '../../../models/CleverInfo';
import {ClassLinkInfo} from '../../../models/ClassLinkInfo';
import {DeviceDetection} from '../../../device-detection.helper';

declare const window;

@Injectable()
export class SchoolsEffects {

  getSchools$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(schoolsActions.getSchools),
      exhaustMap(action => {
        return this.http.getSchools()
          .pipe(
            map((schools: School[]) => {
              window.waitForAppLoaded(true);
              return schoolsActions.getSchoolsSuccess({schools});
            }),
            catchError(error => {
              const errorMessage = error && error.error && error.error.detail ? error.error.detail : 'School loading error';
              return of(schoolsActions.getSchoolsFailure({errorMessage}));
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
              catchError(error => {
                return of(schoolsActions.updateSchoolFailure({errorMessage: error.message}));
              })
            );
        })
      );
  });

  showErrorToast$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getSchoolsFailure),
        switchMap((action: any) => {
          window.appLoaded();
          this.loginService.loginErrorMessage$.next(action.errorMessage);
          this.loginService.clearInternal(true);
          this.http.clearInternal();
          this.http.setSchool(null);
          this.userService.clearUser();
          this.userService.userData.next(null);
          return [schoolsActions.errorToastSuccess(), schoolsActions.clearSchools()];
        })
      );
  });

  getSchoolSyncInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getSchoolSyncInfo),
        concatMap((action: any) => {
          return this.adminService.getSpSyncing()
            .pipe(
              map((syncInfo: SchoolSyncInfo) => {
                return schoolsActions.getSchoolSyncInfoSuccess({syncInfo});
              }),
              catchError(error => of(schoolsActions.getSchoolSyncInfoFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateSchoolSyncInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.updateSchoolSyncInfo),
        concatMap((action) => {
          return this.adminService.updateSpSyncing(action.data)
            .pipe(
              map((syncInfo: any) => {
                if (action.data.selector_students) {
                  return schoolsActions.updateGSuiteInfoSelectors({selectors: action.data});
                }
                return schoolsActions.updateSchoolSyncInfoSuccess({syncInfo});
              }),
              catchError(error => of(schoolsActions.updateSchoolSyncInfoFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getGSuiteInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getGSuiteSyncInfo),
        concatMap((action) => {
          return this.adminService.getGSuiteOrgs()
            .pipe(
              map((gSuiteInfo: GSuiteOrgs) => {
                return schoolsActions.getGSuiteSyncInfoSuccess({gSuiteInfo});
              }),
              catchError(error => of(schoolsActions.getGSuiteSyncInfoFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateGSuiteInfoSelectors$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.updateGSuiteInfoSelectors),
        map((action) =>  {
          const selectors = {
            admin: {
              selector: action.selectors.selector_admins,
            },
            student: {
              selector: action.selectors.selector_students
            },
            teacher: {
              selector: action.selectors.selector_teachers
            },
            assistant: {
              selector: action.selectors.selector_assistants
            }
          };
          return schoolsActions.updateGSuiteInfoSelectorsSuccess({selectors});
        })
      );
  });

  getSchoolCleverInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getCleverInfo),
        switchMap((action: any) => {
          return this.adminService.getCleverInfo()
            .pipe(
              map((cleverInfo: CleverInfo) => {
                return schoolsActions.getCleverInfoSuccess({cleverInfo});
              }),
              catchError(error => of(schoolsActions.getCleverInfoFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getSchoolClassLinkInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.getClassLinkInfo),
        switchMap((action: any) => {
          return this.adminService.getClassLinkSyncInfo()
            .pipe(
              map((classLinkInfo: ClassLinkInfo) => {
                return schoolsActions.getClassLinkSuccess({classLinkInfo});
              }),
              catchError(error => of(schoolsActions.getClassLinkFailure({errorMessage: error.message})))
            );
        })
      );
  });

  syncGsuite$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.syncGsuite),
        exhaustMap(action => {
          return this.adminService.gsuiteSyncNow()
            .pipe(
              map((data) => {
                return schoolsActions.syncGsuiteSuccess({data});
              }),
              catchError(error => of(schoolsActions.syncGsuiteFailure({errorMessage: error.message})))
            );
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
  ) {}
}
