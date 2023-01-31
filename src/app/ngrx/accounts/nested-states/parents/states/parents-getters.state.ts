import { createSelector } from '@ngrx/store';
import { getAccountsState, IAccountsState } from '../../../states';
import { adapter } from '../../admins/reducers';
import { ParentsStates } from './parents.states';

export const getParentsAccountsProfiles = createSelector(getAccountsState, (state: IAccountsState) => state.parentsAccounts);

export const getLoadedParents = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.loaded);

export const getLoadingParents = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.loading);

export const getNextRequestParents = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.nextRequest);

export const getLastAddedParents = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => {
	return state.lastAddedParents;
});

export const getParentSort = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.sortValue);

export const getAddedParent = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.addedUser);

export const getCurrentUpdatedParent = createSelector(getParentsAccountsProfiles, (state: ParentsStates) => state.currentUpdatedAccount);

// export const getParentsStats = createSelector(
//   getParentsAccountsProfiles,
//   (state) => state.parentsStats
// );

// export const getParentsStatsLoading = createSelector(
//   getParentsAccountsProfiles,
//   (state) => state.statsLoading
// );

// export const getParentsStatsLoaded = createSelector(
//   getParentsAccountsProfiles,
//   (state) => state.statsLoaded
// );

export const getCountParents = adapter.getSelectors(getParentsAccountsProfiles).selectTotal;
export const getParentsAccountsEntities = adapter.getSelectors(getParentsAccountsProfiles).selectEntities;

export const getParentsAccountsCollection = adapter.getSelectors(getParentsAccountsProfiles).selectAll;
