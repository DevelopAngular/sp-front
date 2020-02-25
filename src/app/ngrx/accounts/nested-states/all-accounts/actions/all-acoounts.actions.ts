import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {RoleProps} from '../../../states';

const COMPONENT = 'All Accounts';

export const getAllAccounts = createAction(`[${COMPONENT}] GET All Accounts`, props<RoleProps>());
export const getAllAccountsSuccess = createAction(`[${COMPONENT}] Get All Accounts Success`, props<{accounts: User[], next: string}>());
export const getAllAccountsFailure = createAction(`[${COMPONENT}] Get All Accounts Failure`, props<{errorMessage: string}>());

export const getMoreAccounts = createAction(`[${COMPONENT}] Get More Accounts`, props<{role: string}>());
export const getMoreAccountsSuccess = createAction(`[${COMPONENT}] Get More Accounts Success`, props<{moreAccounts: User[], next: string}>());
export const getMoreAccountsFailure = createAction(`[${COMPONENT}] Get More Accounts Failure`, props<{errorMessage: string}>());

export const removeAllAccount = createAction(`[${COMPONENT}] Remove All Account`, props<{id: string | number}>());
export const removeAllAccountSuccess = createAction(`[${COMPONENT}] Remove All Account Success`, props<{id: string | number}>());
export const removeAllAccountFailure = createAction(`[${COMPONENT}] Remove All Account Failure`, props<{errorMessage: string}>());

