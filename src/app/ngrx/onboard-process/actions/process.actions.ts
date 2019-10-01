import {createAction, props} from '@ngrx/store';

const COMPONENT = 'Onboard Process';

export const getOnboardProcess = createAction(`[${COMPONENT}] Get Onboard Process`);
export const getOnboardProcessSuccess = createAction(`[${COMPONENT}] Get Onboard Process Success`, props<{process: any}>());
export const getOnboardProcessFailure = createAction(`[${COMPONENT}] Get Onboard Process Failure`, props<{errorMessage: string}>());
