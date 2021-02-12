import {createAction, props} from '@ngrx/store';
import {RepresentedUser} from '../../../navbar/navbar.component';

const RUSERS = 'Represented Users';

export const getRUsers = createAction(`[${RUSERS}] Get Represented Users`);
export const getRUsersSuccess = createAction(`[${RUSERS}] Get Represented Users Success`, props<{rUsers: RepresentedUser[]}>());
export const getRUsersFailure = createAction(`[${RUSERS}] Get Represented Users Failure`, props<{errorMessage: string}>());

export const updateEffectiveUser = createAction(`[${RUSERS}] Update Effective User`, props<{effectiveUser: RepresentedUser}>());

export const clearRUsers = createAction(`[${RUSERS}] Clear Represented Users`);
