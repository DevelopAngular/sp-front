import {createAction, props} from '@ngrx/store';
import {Toast} from '../../../models/Toast';

export const TOAST = 'Toast';

export const openToastAction = createAction(`[${TOAST}] Open Toast`, props<{data: Toast}>());
export const closeToastAction = createAction(`[${TOAST}] Close Toast`);
