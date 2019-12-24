import { createAction, props } from '@ngrx/store';
import { Pinnable } from '../../../models/Pinnable';

export const COMPONENT = 'Rooms Component';

export const getPinnables = createAction(`[${COMPONENT}] Get Pinnables`);
export const getSuccessPinnable = createAction(`[${COMPONENT}] Get Pinnables Success`, props<{ pinnables: Pinnable[] }>());
export const getPinnablesFailure = createAction(`[${COMPONENT}] Get Pinnables Failure`, props<{ errorMessage: string} >());

export const postPinnables = createAction(`[${COMPONENT}] Post Pinnables`, props<{ data: any }>());
export const postPinnablesSuccess = createAction(`[${COMPONENT}] Post Pinnables Success`, props<{ pinnable: Pinnable }>());
export const postPinnablesFailure = createAction(`[${COMPONENT}] Post Pinnables Failure`, props<{ errorMessage: string}>());

export const updatePinnable = createAction(`[${COMPONENT}] Update Pinnable`, props<{id: string | number, pinnable: any}>());
export const updatePinnableSuccess = createAction(`[${COMPONENT}] Update pinnable Success`, props<{pinnable: Pinnable}>());
export const updatePinnableFailure = createAction(`[${COMPONENT}] Update Pinnable Failure`, props<{ errorMessage: string}>());

export const removePinnable = createAction(`[${COMPONENT}] Remove Pinnable`, props<{ id: string | number}>());
export const removeSuccessPinnable = createAction(`[${COMPONENT}] Remove Success Pinnable`, props<{ id: string | number }>());
export const removePinnableFailure = createAction(`[${COMPONENT}] Remove Pinnable Failure`, props<{ errorMessage: string }>());

export const arrangedPinnable = createAction(`[${COMPONENT}] Arranged Pinnable`, props<{order: any}>());
export const arrangedPinnableSuccess = createAction(`[${COMPONENT}] Arranged Pinnable Success`);
export const arrangedPinnableFailure = createAction(`[${COMPONENT}] Arranged Pinnable Failure`, props<{errorMessage: string}>());

