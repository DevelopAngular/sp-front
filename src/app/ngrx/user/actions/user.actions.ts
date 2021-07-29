import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/User';

export const getUser = createAction(`[User] Get User`);
export const getUserSuccess = createAction(`[User] Get User Success`, props<{user: User}>());
export const getUserFailure = createAction(`[User] Get User Failure`, props<{errorMessage: string}>());

export const getUserPinAction = createAction(`[User] Get User Pin`);
export const getUserPinSuccess = createAction(`[User] Get User Pin Success`, props<{pin: string | number}>());
export const getUserPinFailure = createAction(`[User] Get User Pin Failure`, props<{errorMessage: string}>());

export const updateUserAction = createAction(`[User] Update User`, props<{user: User, data: any}>());
export const updateUserSuccess = createAction(`[User] Update User Success`, props<{user: User}>());
export const updateUserFailure = createAction(`[User] Update User Failure`, props<{errorMessage: string}>());

export const updateUserPin = createAction(`[User] Update User Pin`, props<{pin: string}>());
export const updateUserPinSuccess = createAction(`[User] Update User Pin Success`, props<{pin: string}>());

export const updateUserPicture = createAction(`[User] Update User Picture`, props<{file: File}>());
export const updateUserPictureSuccess = createAction(`[User] Update User Picture Success`, props<{user: User}>());
export const updateUserPictureFailure = createAction(`[User] Update User Picture Failure`, props<{errorMessage: string}>());

export const clearUser = createAction(`[User] Clear User`);
