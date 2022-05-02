import {createAction, props} from '@ngrx/store';
import {Report, ReportDataUpdate} from '../../../models/Report';

export const COMPONENT = 'Hall Monitor Admin';

export const getReports = createAction(`[${COMPONENT}] Get Reports`, props<{ queryParams: any }>());
export const getReportsSuccess = createAction(`[${COMPONENT}] Get Reports Success`, props<{reports: Report[], next: string}>());
export const getReportsFailure = createAction(`[${COMPONENT}] Get Reports Failure`, props<{errorMessage: string}>());

export const searchReports = createAction(`[${COMPONENT}] Search Reports`, props<{before: any, after: any}>());
export const searchReportsSuccess = createAction(`[${COMPONENT}] Search Reports Success`, props<{reports: Report[]}>());
export const searchReportsFailure = createAction(`[${COMPONENT}] Search Reports Failure`, props<{errorMessage: string}>());

export const postReport = createAction(`[${COMPONENT}] Post Report`, props<{data: ReportDataUpdate}>());
export const postReportSuccess = createAction(`[${COMPONENT}] Post Report Success`, props<{reports: Report[]}>());
export const postReportFailure = createAction(`[${COMPONENT}] Post Report Failure`, props<{errorMessage: string}>());

export const getMoreReports = createAction(`[${COMPONENT}] Get More Reports`);
export const getMoreReportsSuccess = createAction(`[${COMPONENT}] Get More Reports Success`, props<{reports: Report[], next: string}>());
export const getMoreReportsFailure = createAction(`[${COMPONENT}] Get More Reports Failure`, props<{errorMessage: string}>());

const COMPONENT_ADMIN_EXPLORE_REPORTS = 'Explore Reports Admin';

export const patchReport = createAction(`[${COMPONENT_ADMIN_EXPLORE_REPORTS}] Patch Report`, props<{report: ReportDataUpdate}>());
export const patchReportSuccess = createAction(`[${COMPONENT_ADMIN_EXPLORE_REPORTS}] Patch Report Success`, props<{report: Report}>());
export const patchReportFailure = createAction(`[${COMPONENT_ADMIN_EXPLORE_REPORTS}] Patch Report Failure`, props<{errorMessage: string}>());
