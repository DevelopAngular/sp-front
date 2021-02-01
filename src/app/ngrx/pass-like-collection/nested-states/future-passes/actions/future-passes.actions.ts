import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {HallPass} from '../../../../../models/HallPass';

const FUTUREPASSES = 'Future Passes';

export const getFuturePasses = createAction(`[${FUTUREPASSES}] Get Future Passes`, props<{user: User}>());
export const getFuturePassesSuccess = createAction(`[${FUTUREPASSES}] Get Future Passes Success`, props<{futurePasses: HallPass[]}>());
export const getFuturePassesFailure = createAction(`[${FUTUREPASSES}] Get Future Passes Failure`, props<{errorMessage: string}>());

