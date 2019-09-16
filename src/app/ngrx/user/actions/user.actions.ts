import {createAction, props} from '@ngrx/store';
import {User} from '../../../models/User';

export const getUser = createAction(`[User] Get User`);
export const getUserSuccess = createAction(`[User] Get User Success`, props<{user: User}>());
export const getUserFailure = createAction(`[User] Get User Failure`, props<{errorMessage: string}>());
