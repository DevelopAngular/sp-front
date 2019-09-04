import { createAction, props } from '@ngrx/store';
import { RoleProps } from '../../../states';
import { User } from '../../../../../models/User';

const ADMIN = 'Admin Accounts';

export const getAdmins = createAction(`[${ADMIN}] Get Admins`, props<RoleProps>());
export const getAdminsSuccess = createAction(`[${ADMIN}] Get Admins Success`, props<{admins: User[]}>());
export const getAdminsFailure = createAction(`[${ADMIN} Get Admins Failure`, props<{errorMessage: string}>());

export const postAdmin = createAction(`[${ADMIN}] Post Admin Success`, props<{admin: User}>());
export const postAdminSuccess = createAction(`[${ADMIN}] PostAdminSuccess`, props<{admin: User}>());

export const removeAdminAccount = createAction(`[${ADMIN}] Remove Admin Account`, props<{id: number | string}>());
export const removeAdminAccountSuccess = createAction(`[${ADMIN}] Remove Admin Account Success`, props<{id: string | number}>());
export const removeAdminAccountFailure = createAction(`[${ADMIN}] Remove Admin Account Failure`, props<{errorMessage: string}>());


