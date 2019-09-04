import {createSelector} from '@ngrx/store';
import {getAccountsState, IAccountsState} from '../../../states';
import {adapter} from '../reducers';
import {AdminsState} from './admins.state';

export const getAdminsAccountsProfiles = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.adminsAccounts
);

export const getLoadedAdminsAccounts = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.loaded
);

export const getLoadingAdminsAccounts = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.loading
);

export const getCountAdmins = adapter.getSelectors(getAdminsAccountsProfiles).selectTotal;

export const getAdminsCollections = adapter.getSelectors(getAdminsAccountsProfiles).selectAll;
