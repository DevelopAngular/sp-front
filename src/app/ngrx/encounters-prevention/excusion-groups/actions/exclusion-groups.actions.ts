import {createAction, props} from '@ngrx/store';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

const EG = 'Exclusion Group';

export const getExclusionGroups = createAction(`[${EG}] Get`);
export const getExclusionGroupsSuccess = createAction(`[${EG}] Get Success`, props<{groups: ExclusionGroup[]}>());
export const getExclusionGroupsFailure = createAction(`[${EG}] Get Failure`, props<{errorMessage: string}>());
