import {AppState} from '../../../app-state/app-state';
import {adapter} from '../reducers/exclusion-groups.reducer';
import {createSelector} from '@ngrx/store';
import {IExclusionGroupsState} from './exclusion-groups.state';

export const getExclusionGroupState = (state: AppState) => state.exclusionGroups;

export const getExclusionGroupsCollection = adapter.getSelectors(getExclusionGroupState).selectAll;

export const getExclusionGroupsLoading = createSelector(
  getExclusionGroupState,
  (state: IExclusionGroupsState) => state.loading
);

export const getExclusionGroupsLoaded = createSelector(
  getExclusionGroupState,
  (state: IExclusionGroupsState) => state.loaded
);
