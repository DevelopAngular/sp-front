import {createAction, props} from '@ngrx/store';

const INTROS = 'INTROS';

export const getIntros = createAction(`[${INTROS}] Get Intros`);
export const getIntrosSuccess = createAction(`[${INTROS}] Get Intros Success`, props<{data: any}>());
export const getIntrosFailure = createAction(`[${INTROS}] Get Intros Failure`, props<{errorMessage: string}>());

export const updateIntros = createAction(`[${INTROS}] Update intros`, props<{intros: any, device: string, version: string}>());
export const updateIntrosSuccess = createAction(`[${INTROS}] Update intros Success`, props<{data: any}>());
export const updateIntrosFailure = createAction(`[${INTROS}] Update intros Failure`, props<{errorMessage: string}>());
