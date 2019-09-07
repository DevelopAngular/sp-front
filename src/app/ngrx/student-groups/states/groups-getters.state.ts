import { AppState } from '../../app-state/app-state';
import { groupsAdapter } from '../reducers';
import { createSelector } from '@ngrx/store';
import { GroupsStates } from './groups.states';

export const getStudentGroupsState = (state: AppState) => state.studentGroups;

export const getStudentGroupsCollection = groupsAdapter.getSelectors(getStudentGroupsState).selectAll;

export const getStudentGroupsEntities = groupsAdapter.getSelectors(getStudentGroupsState).selectEntities;

export const getCurrentStudentGroupId = createSelector(
  getStudentGroupsState,
  (state: GroupsStates) => state.currentGroupId
);

export const getCurrentStudentGroup = createSelector(
  getStudentGroupsEntities,
  getCurrentStudentGroupId,
  (entities, id) => entities[id]
);

export const getLoadingGroups = createSelector(
  getStudentGroupsState,
  (state: GroupsStates) => state.loading
);

export const getLoadedGroups = createSelector(
  getStudentGroupsState,
  (state: GroupsStates) => state.loaded
);


