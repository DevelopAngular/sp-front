import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {HallPass} from '../../../../../models/HallPass';
import {Observable} from 'rxjs';

const ACTIVEPASSES = 'Active Passes';

export const getActivePasses = createAction(`[${ACTIVEPASSES}] Get Active Passes`, props<{sortingEvents: Observable<{ sort: string; search_query: string }>, user: User}>());
export const getActivePassesSuccess = createAction(`[${ACTIVEPASSES}] Get Active Passes Success`, props<{activePasses: HallPass[]}>());
export const getActivePassesFailure = createAction(`[${ACTIVEPASSES}] Get Active Passes Failure`, props<{errorMessage: string}>());

export const updateActivePasses = createAction(`[${ACTIVEPASSES}] Update Active Passes`, props<{sortingEvents: Observable<{ sort: string; search_query: string }>, user: User}>());
// export const updateActivePassesSuccess = createAction(`[${ACTIVEPASSES}] Update Active Passes Success`, props<{activePasses: HallPass[]}>());
// export const updateActivePassesFailure = createAction(`[${ACTIVEPASSES}] Update Active Passes Failure`, props<{errorMessage: string}>());
