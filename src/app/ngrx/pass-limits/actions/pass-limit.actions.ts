import { createAction, props } from '@ngrx/store';
import { PassLimit } from '../../../models/PassLimit';

const PASS_LIMIT = 'Pass Limit';

export const getPassLimits = createAction(`[${PASS_LIMIT}] Get Pass Limits`);
export const getPassLimitsSuccess = createAction(`[${PASS_LIMIT}] Get Pass Limits Success`, props<{pass_limits: PassLimit[]}>());
export const getPassLimitsFailure = createAction(`[${PASS_LIMIT}] Get Pass Limits Failure`, props<{errorMessage: string}>());

export const updatePassLimit = createAction(`[${PASS_LIMIT}] Update Pass Limit`, props<{item: any}>());
export const updatePassLimitSuccess = createAction(`[${PASS_LIMIT}] Update Pass Limit Success`, props<{pass_limit: any}>());
export const updatePassLimitFailure = createAction(`[${PASS_LIMIT}] Update Pass Limit Failure`, props<{errorMessage: string}>());

