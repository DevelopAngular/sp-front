import {createAction, props} from '@ngrx/store';

const DASHBOARD = 'Dashboard';

export const getDashboardData = createAction(`[${DASHBOARD}] Get Dashboard Data`);
export const getDashboardDataSuccess = createAction(`[${DASHBOARD}] Get Dashboard Data Success`, props<{data: any}>());
export const getDashboardDataFailure = createAction(`[${DASHBOARD}] Get Dashboard Data Failure`, props<{errorMessage: string}>());

