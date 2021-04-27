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

export const getNextRequestAdminsAccounts = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.nextRequest
);

export const getLastAddedAdminsAccounts = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.lastAddedAdmins
);

export const getAdminSort = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.sortValue
);

export const getAddedAdmin = createSelector(
  getAdminsAccountsProfiles,
  (state: AdminsState) => state.addedUser
);

export const getCountAdmins = adapter.getSelectors(getAdminsAccountsProfiles).selectTotal;
export const getAdminsAccountsEntities = adapter.getSelectors(getAdminsAccountsProfiles).selectEntities;

export const getAdminsCollections = adapter.getSelectors(getAdminsAccountsProfiles).selectAll;
