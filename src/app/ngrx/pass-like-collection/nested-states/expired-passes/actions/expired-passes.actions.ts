import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {HallPass} from '../../../../../models/HallPass';

const EXPIREDPASSES = 'Expired Passes';

export const getExpiredPasses = createAction(`[${EXPIREDPASSES}] Get Expired Passes`, props<{user: User, timeFilter: string}>());
export const getExpiredPassesSuccess = createAction(`[${EXPIREDPASSES}] Get Expired Passes Success`, props<{expiredPasses: HallPass[]}>());
export const getExpiredPassesFailure = createAction(`[${EXPIREDPASSES}] Get Expired Passes Failure`, props<{errorMessage: string}>());

export const getMoreExpiredPasses = createAction(`[${EXPIREDPASSES}] Get More Expired Passes`, props<{user: User, timeFilter: string, offset: string}>());
export const getMoreExpiredPassesSuccess = createAction(`[${EXPIREDPASSES}] Get More Expired Passes Success`, props<{passes: HallPass[]}>());
export const getMoreExpiredPassesFailure = createAction(`[${EXPIREDPASSES}] Get More Expired Passes Failure`, props<{errorMessage: string}>());

export const filterExpiredPasses = createAction(`[${EXPIREDPASSES}] Filter Passes`, props<{user: User, timeFilter: string}>());
export const filterExpiredPassesSuccess = createAction(`[${EXPIREDPASSES}] Filter Passes Success`, props<{expiredPasses: HallPass[]}>());
export const filterExpiredPassesFailure = createAction(`[${EXPIREDPASSES}] Filter Passes Failure`, props<{errorMessage: string}>());

