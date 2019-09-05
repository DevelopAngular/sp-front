import {createAction, props} from '@ngrx/store';
import {PostRoleProps, RoleProps} from '../states';

export const getAccounts = createAction(`[Accounts] Get Accounts`, props<RoleProps>());

export const postAccounts = createAction(`[Accounts] Post Accounts`, props<PostRoleProps>());

export const removeAccount = createAction(`[Accounts] Remove Account`, props<{id: number | string, role: string}>());

