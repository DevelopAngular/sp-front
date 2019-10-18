import { createAction, props } from '@ngrx/store';
import { PostRoleProps, RoleProps } from '../states';
import { User } from '../../../models/User';

export const getAccounts = createAction(`[Accounts] Get Accounts`, props<RoleProps>());

export const postAccounts = createAction(`[Accounts] Post Accounts`, props<PostRoleProps>());

export const removeAccount = createAction(`[Accounts] Remove Account`, props<{id: number | string, role: string}>());

export const updateAccountActivity = createAction(`[Accounts] Update Account Activity`,
  props<{profile: User, active: boolean, role: string}>());

export const updateAccountPermissions =
  createAction(`[Accounts] Update Permissions`, props<{profile: User, permissions: any, role: string}>());

