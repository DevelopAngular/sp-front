import {createAction, props} from '@ngrx/store';
import {PostRoleProps, RoleProps} from '../states';
import {User} from '../../../models/User';

export const getAccounts = createAction(`[Accounts] Get Accounts`, props<RoleProps>());

export const getMoreAccounts = createAction(`[Accounts] Get More Accounts`, props<{role: string}>());

export const postAccounts = createAction(`[Accounts] Post Accounts`, props<PostRoleProps>());

export const postSelectedAccounts = createAction(`[Accounts] Post Selected Accounts`, props<PostRoleProps>());
export const postSelectedAccountsSuccess = createAction(`[Accounts] Post Selected Accounts Success`);

export const removeAccount = createAction(`[Accounts] Remove Account`, props<{id: number | string, role: string}>());

export const updateAccounts = createAction(`[Accounts] Update Account`, props<{account: User}>());

export const addUserToProfile = createAction(`[Accounts] Add User To Profile`, props<{user: User, role: string}>());

export const updateAccountActivity = createAction(`[Accounts] Update Account Activity`,
  props<{profile: User, active: boolean, role: string}>());

export const updateAccountPermissions =
  createAction(`[Accounts] Update Permissions`, props<{profile: User, permissions: any, role: string}>());

export const bulkAddAccounts = createAction('[Accounts] Bulk Add Accounts', props<{accounts: any[]}>());
export const bulkAddAccountsSuccess = createAction('[Accounts] Bulk Add Accounts Success', props<{accounts: User[]}>());
export const bulkAddAccountsFailure = createAction('[Accounts] Bulk Add Accounts Failure', props<{errorMessage: string}>());

export const sortAccounts = createAction('[Accounts] Sort Accounts', props<{role: string, queryParams: any}>());
export const sortAccountsSuccess = createAction('[Accounts] Sort Accounts Success', props<{users: User[], role: string, next: string, sortValue: string}>());
export const sortAccountsFailure = createAction('[Accounts] Sort Accounts Failure', props<{errorMessage: string}>());

