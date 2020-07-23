import { AppState } from '../../app-state/app-state';
import { adapter } from '../reducers';
import { createSelector } from '@ngrx/store';
import { IPassesState } from './passes.state';

export const getPassesState = (state: AppState) => state.passes;

export const getPassesEntities = adapter.getSelectors(getPassesState).selectEntities;
export const getPassesCollection = adapter.getSelectors(getPassesState).selectAll;

export const getPassesLoaded = createSelector(
  getPassesState,
  (state: IPassesState) => state.loaded
);

export const getPassesNextUrl = createSelector(
  getPassesState,
  (state: IPassesState) => state.nextRequest
);

export const getMorePassesLoading = createSelector(
  getPassesState,
  (state: IPassesState) => state.moreLoading
);

