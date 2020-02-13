import { adapter } from '../reducers';
import {getAccountsState, IAccountsState} from '../../../states';
import {createSelector} from '@ngrx/store';
import {AllAccountsState} from './all-accounts.state';

export const getAllAccountsProfiles = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.allAccounts
);

export const getLoadedAllAccounts = createSelector(
  getAllAccountsProfiles,
  (state: AllAccountsState) => state.loaded
);

export const getLoadingAllAccounts = createSelector(
  getAllAccountsProfiles,
  (state: AllAccountsState) => state.loading
);

export const getNextRequestAllAccounts = createSelector(
  getAllAccountsProfiles,
  (state: AllAccountsState) => state.nextRequest
);

export const getCountAllAccounts = adapter.getSelectors(getAllAccountsProfiles).selectTotal;

export const getAllAccountsCollection = adapter.getSelectors(getAllAccountsProfiles).selectAll;
