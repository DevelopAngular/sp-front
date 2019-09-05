import {createSelector} from '@ngrx/store';
import {getAccountsState, IAccountsState} from '../../../states';
import {CountAccountsState} from './count-accounts.state';

export const getCountAccountsState = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.countAccounts
);

export const getCountAccountsResult = createSelector(
  getCountAccountsState,
  (state: CountAccountsState) => {
    return state.countData;
  }
);
