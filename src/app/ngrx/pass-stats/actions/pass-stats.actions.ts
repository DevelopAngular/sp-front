import {createAction, props} from '@ngrx/store';

const STATS = 'Pass Stats';

export const getPassStats = createAction(`[${STATS}] Get Pass Stats`);
export const getPassStatsSuccess = createAction(`[${STATS}] Get Pass Stats Success`, props<{data: any}>());
export const getPassStatsFailure = createAction(`[${STATS}] Get Pass Stats Failure`, props<{errorMessage: string}>());
