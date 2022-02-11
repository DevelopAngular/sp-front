import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, throwError} from 'rxjs';

import * as reportsActions from '../actions';
import {catchError, concatMap, exhaustMap, map, switchMap, take} from 'rxjs/operators';
import {AdminService} from '../../../services/admin.service';
import {Report} from '../../../models/Report';
import {addReportToStats} from '../../accounts/nested-states/students/actions';
import {openToastAction} from '../../toast/actions';

@Injectable()
export class ReportsEffects {
  getReports$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(reportsActions.getReports),
        concatMap((action: any) => {
          return this.adminService.getReportsRequest(action.queryParams)
            .pipe(
              map(({next, results}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                return reportsActions.getReportsSuccess({reports: results, next: nextUrl});
              }),
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
              switchMap((reports: Report[]) => {
                return [
                  reportsActions.postReportSuccess({reports}),
                  addReportToStats({report: reports[0]}),
                  openToastAction({data: {
                    title: 'Report sent',
                    subtitle: 'The report has been sent to admins.',
                    type: 'success'
                  }})
                ];
              }),
              catchError(error => of(reportsActions.postReportFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMoreReports$ =  createEffect(() => {
    return this.actions$
      .pipe(
        ofType(reportsActions.getMoreReports),
        exhaustMap(() => this.adminService.reports.nextUrl$.pipe(take(1))),
        exhaustMap((url: string) => {
          if (!url) {
            return throwError('No more reports');
          }
          return this.adminService.getReportsByUrl(url)
            .pipe(
              map(({results, next}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                return reportsActions.getMoreReportsSuccess({reports: results, next: nextUrl});
              }),
            );
        }),
        catchError(error => {
          return of(reportsActions.getMoreReportsFailure({errorMessage: error.message}));
        })
      );
  });

  constructor(
    private actions$: Actions,
    private adminService: AdminService
  ) {}
}
