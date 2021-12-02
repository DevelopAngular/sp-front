import {createAction, props} from '@ngrx/store';
import {Toast} from '../../../models/Toast';

export const TOAST = 'Toast';

export const openToastAction = createAction(`[${TOAST}] Open Toast`, props<{data: Toast, id?: string}>());
export const openToastActionSuccess = createAction(`[${TOAST}] Open Toast Success`, props<{data: Toast, id: string}>());

export const getCurrentToastData = createAction(`[${TOAST}] Get Toast Data`, props<{id: string}>());

export const closeToastAction = createAction(`[${TOAST}] Close Toast`, props<{ids?: string[]}>());
export const closeToastActionSuccess = createAction(`[${TOAST}] Close Toast Success`, props<{ids: string[]}>());

export const closeAllToasts = createAction(`[${TOAST}] Close All Toasts`);
