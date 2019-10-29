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

export const updateAdminActivity = createAction(`[${ADMIN}] Update Admin Activity`, props<{profile: User, active: boolean}>());
export const updateAdminActivitySuccess = createAction(`[${ADMIN}] Update Admin Activity Success`, props<{profile: User}>());
export const updateAdminActivityFailure = createAction(`[${ADMIN}] Update Admin Activity Failure`, props<{errorMessage: string}>());

export const updateAdminPermissions = createAction(`[${ADMIN}] Update Admin Permissions`, props<{profile: User, permissions: any}>());
export const updateAdminPermissionsSuccess = createAction(`[${ADMIN}] Update Admin Permissions Success`, props<{profile: User}>());
export const updateAdminPermissionsFailure = createAction(`[${ADMIN}] Update Admin Permissions Failure`, props<{errorMessage: string}>());
