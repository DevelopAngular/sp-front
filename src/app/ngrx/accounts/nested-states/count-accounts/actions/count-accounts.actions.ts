import {createAction, props} from '@ngrx/store';

const COUNT = `Admin Accounts`;

export const getCountAccounts = createAction(`[${COUNT}] Get Count Accounts`);
export const getCountAccountsSuccess = createAction(`[${COUNT}] Get Count Accounts Success`, props<{countData: any}>());
export const getCountAccountsFailure = createAction(`[${COUNT}] Get Count Accounts Failure`, props<{errorMessage: string}>());

