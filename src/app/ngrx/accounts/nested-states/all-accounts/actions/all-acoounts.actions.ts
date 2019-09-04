import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {RoleProps} from '../../../states';

const COMPONENT = 'All Accounts';

export const getAllAccounts = createAction(`[${COMPONENT}] GET All Accounts`, props<RoleProps>());
export const getAllAccountsSuccess = createAction(`[${COMPONENT}] Get All Accounts Success`, props<{accounts: User[]}>());
export const getAllAccountsFailure = createAction(`[${COMPONENT}] Get All Accounts Failure`, props<{errorMessage: string}>());

export const removeAllAccount = createAction(`[${COMPONENT}] Remove All Account`, props<{id: string | number}>());
export const removeAllAccountSuccess = createAction(`[${COMPONENT}] Remove All Account Success`, props<{id: string | number}>());
export const removeAllAccountFailure = createAction(`[${COMPONENT}] Remove All Account Failure`, props<{errorMessage: string}>());

