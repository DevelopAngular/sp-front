import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';

import * as reportsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import {AdminService} from '../../../services/admin.service';
import {Report} from '../../../models/Report';

@Injectable()
export class ReportsEffects {
  getReports$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(reportsActions.getReports),
        concatMap((action: any) => {
          return this.adminService.getReportsRequest(action.limit)
            .pipe(
              map((reports: any) => reportsActions.getReportsSuccess({reports: reports.results})),
              catchError(error => of(reportsActions.getReportsFailure({ errorMessage: error.message })))
            );
        }));
  });

  searchReports$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(reportsActions.searchReports),
        concatMap((action: any) => {
          return this.adminService.searchReports(action.before, action.after)
            .pipe(
              map((reports: any) => {
                return reportsActions.searchReportsSuccess({reports});
              }),
              catchError(error => of(reportsActions.searchReportsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  postReport$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(reportsActions.postReport),
        concatMap((action: any) => {
          return this.adminService.sendReport(action.data)
            .pipe(
              map((reports: Report[]) => {
                return reportsActions.postReportSuccess({reports});
              }),
              catchError(error => of(reportsActions.postReportFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
