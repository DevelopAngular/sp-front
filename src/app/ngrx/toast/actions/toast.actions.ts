import {createAction, props} from '@ngrx/store';

export const TOAST = 'Toast';

export const openToastAction = createAction(`[${TOAST}] Open Toast`, props<{data: any}>());
export const closeToastAction = createAction(`[${TOAST}] Close Toast`);
