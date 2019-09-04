import {createAction, props} from '@ngrx/store';
import {Report} from '../../../models/Report';

export const COMPONENT = 'Hall Monitor Admin';

export const getReports = createAction(`[${COMPONENT}] Get Reports`, props<{ limit: number }>());
export const getReportsSuccess = createAction(`[${COMPONENT}] Get Reports Success`, props<{ reports: Report[] }>());
export const getReportsFailure = createAction(`[${COMPONENT}] Get Reports Failure`, props<{errorMessage: string}>());

export const searchReports = createAction(`[${COMPONENT}] Search Reports`, props<{before: any, after: any}>());
export const searchReportsSuccess = createAction(`[${COMPONENT}] Search Reports Success`, props<{reports: Report[]}>());
export const searchReportsFailure = createAction(`[${COMPONENT}] Search Reports Failure`, props<{errorMessage: string}>());

