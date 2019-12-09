import {createAction, props} from '@ngrx/store';
import {User} from '../../../models/User';

export const getUser = createAction(`[User] Get User`);
export const getUserSuccess = createAction(`[User] Get User Success`, props<{user: User}>());
export const getUserFailure = createAction(`[User] Get User Failure`, props<{errorMessage: string}>());

export const getUserPinAction = createAction(`[User] Get User Pin`);
export const getUserPinSuccess = createAction(`[User] Get User Pin Success`, props<{pin: string | number}>());
export const getUserPinFailure = createAction(`[User] Get User Pin Failure`, props<{errorMessage: string}>());

export const clearUser = createAction(`[User] Clear User`);
