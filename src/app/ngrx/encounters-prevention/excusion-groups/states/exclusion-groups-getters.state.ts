import {AppState} from '../../../app-state/app-state';
import {adapter} from '../reducers/exclusion-groups.reducer';
import {createSelector} from '@ngrx/store';
import {IExclusionGroupsState} from './exclusion-groups.state';

export const getExclusionGroupState = (state: AppState) => state.exclusionGroups;

export const getExclusionGroupsCollection = adapter.getSelectors(getExclusionGroupState).selectAll;
export const getExclusionGroupsEntities = adapter.getSelectors(getExclusionGroupState).selectEntities;

export const getExclusionGroupsLoading = createSelector(
  getExclusionGroupState,
  (state: IExclusionGroupsState) => state.loading
);

export const getExclusionGroupsLoaded = createSelector(
  getExclusionGroupState,
  (state: IExclusionGroupsState) => state.loaded
);

export const getCurrentExclusionGroupId = createSelector(
  getExclusionGroupState,
  (state: IExclusionGroupsState) => state.currentExclusionGroupId
);

export const getCurrentExclusionGroup = createSelector(
  getExclusionGroupsEntities,
  getCurrentExclusionGroupId,
  (entities, id) => entities[id]
);

export const getEncounterPreventionLength = createSelector(
  getExclusionGroupsCollection,
  (groups) => groups.reduce((acc, group) => {
    return acc + group.prevented_encounters.length;
  }, 0)
);
