import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpService } from '../../../services/http-service';
import * as schoolsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { School } from '../../../models/School';
import { of } from 'rxjs';
import {AdminService} from '../../../services/admin.service';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';

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
                debugger;
                return schoolsActions.updateSchoolSyncInfoSuccess({syncInfo});
              }),
              catchError(error => of(schoolsActions.updateSchoolSyncInfoFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getGG4LInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(schoolsActions.getSchoolsGG4LInfo),
      concatMap(action => {
        return this.adminService.getGG4LSyncInfo()
          .pipe(
            map((gg4lInfo: GG4LSync) => {
              return schoolsActions.getSchoolsGG4LInfoSuccess({gg4lInfo});
            }),
            catchError(error => of(schoolsActions.getSchoolsGG4LInfoFailure({errorMessage: error.message})))
          );
      })
    );
  });

  updateGG4LInfo$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(schoolsActions.updateSchoolsGG4LInfo),
        concatMap((action: any) => {
          return of('').pipe(
            map((gg4lInfo: any) => {
              return schoolsActions.updateSchoolsGG4LInfoSuccess({gg4lInfo});
            }),
            catchError(error => of(schoolsActions.updateSchoolsGG4LInfoFailure({errorMessage: error.message})))
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
