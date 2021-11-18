import {createAction, props} from '@ngrx/store';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

const EG = 'Exclusion Group';

export const getExclusionGroups = createAction(`[${EG}] Get`, props<{queryParams: any}>());
export const getExclusionGroupsSuccess = createAction(`[${EG}] Get Success`, props<{groups: ExclusionGroup[]}>());
export const getExclusionGroupsFailure = createAction(`[${EG}] Get Failure`, props<{errorMessage: string}>());

export const createExclusionGroup = createAction(`[${EG}] Create`, props<{groupData: any}>());
export const createExclusionGroupSuccess = createAction(`[${EG}] Create Success`, props<{group: ExclusionGroup}>());
export const createExclusionGroupFailure = createAction(`[${EG}] Create Failure`, props<{errorMessage: string}>());

export const updateExclusionGroup = createAction(`[${EG}] Update`, props<{group: ExclusionGroup, updateFields: any}>());
export const updateExclusionGroupSuccess = createAction(`[${EG}] Update Success`, props<{group: ExclusionGroup}>());
export const updateExclusionGroupFailure = createAction(`[${EG}] Update Failure`, props<{errorMessage: string}>());

export const removeExclusionGroup = createAction(`[${EG}] Delete`, props<{group: ExclusionGroup}>());
export const removeExclusionGroupSuccess = createAction(`[${EG}] Delete Success`, props<{group: ExclusionGroup}>());
export const removeExclusionGroupFailure = createAction(`[${EG}] Delete Failure`, props<{errorMessage: string}>());


