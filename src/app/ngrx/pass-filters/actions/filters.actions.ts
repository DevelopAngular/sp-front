import {createAction, props} from '@ngrx/store';
import {PassFilters} from '../../../models/PassFilters';

const FILTER = 'Pass Filter';

export const getPassFilter = createAction(`[${FILTER}] Get Pass Filter`, props<{model: string}>());
export const getPassFilterSuccess = createAction(`[${FILTER}] Get Pass Filter Success`, props<{model: string, filterData: PassFilters}>());
export const getPassFilterFailure = createAction(`[${FILTER}] Get Pass Filter Failure`, props<{errorMessage: string}>());

export const updatePassFilter = createAction(`[${FILTER}] Update Pass Filter`, props<{model: string, value: string}>());
export const updatePassFilterSuccess = createAction(`[${FILTER}] Update Pass Filter Success`, props<{model: string, filterData: PassFilters}>());
export const updatePassFilterFailure = createAction(`[${FILTER}] Update Pass Filter Failure`, props<{errorMessage: string}>());

