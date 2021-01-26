import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {HallPass} from '../../../../../models/HallPass';

const EXPIREDPASSES = 'Expired Passes';

export const getExpiredPasses = createAction(`[${EXPIREDPASSES}] Get Expired Passes`, props<{user: User}>());
export const getExpiredPassesSuccess = createAction(`[${EXPIREDPASSES}] Get Expired Passes Success`, props<{expiredPasses: HallPass[]}>());
export const getExpiredPassesFailure = createAction(`[${EXPIREDPASSES}] Get Expired Passes Failure`, props<{errorMessage: string}>());
