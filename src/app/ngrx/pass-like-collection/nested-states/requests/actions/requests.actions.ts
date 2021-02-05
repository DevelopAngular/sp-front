import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {Request} from '../../../../../models/Request';

const REQUESTS = 'Requests';

export const getRequests = createAction(`[${REQUESTS}] Get Requests`, props<{user: User}>());
export const getRequestsSuccess = createAction(`[${REQUESTS}] Get Requests Success`, props<{requests: Request[]}>());
export const getRequestsFailure = createAction(`[${REQUESTS}] Get Requests Failure`, props<{errorMessage: string}>());
