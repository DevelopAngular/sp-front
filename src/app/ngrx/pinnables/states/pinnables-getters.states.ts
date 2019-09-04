import { AppState } from '../../app-state/app-state';
import { adapter } from '../reducers';
import {createSelector} from '@ngrx/store';
import {IPinnablesState} from './pinnables.states';

export const getPinnablesState = (state: AppState) => state.pinnables;

export const getPinnableEntities = adapter.getSelectors(getPinnablesState).selectEntities;

export const getPinnabledIds = adapter.getSelectors(getPinnablesState).selectIds;

export const getCurrentPinnableId = createSelector(
  getPinnablesState,
  (state: IPinnablesState) => state.currentPinnableId
);

export const getIsLoadedPinnables = createSelector(
  getPinnablesState,
  (state: IPinnablesState) => state.loaded
);

export const getIsLoadingPinnables = createSelector(
  getPinnablesState,
  (state: IPinnablesState) => state.loading
);

export const getCurrentPinnable = createSelector(
  getPinnableEntities,
  getCurrentPinnableId,
  (entities, id) => {
    return entities[id];
  }
);

export const getPinnableCollection = adapter.getSelectors(getPinnablesState).selectAll;
