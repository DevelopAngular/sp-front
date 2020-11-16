import {AppState} from '../../app-state/app-state';
import {adapter} from '../reducers';
import {createSelector} from '@ngrx/store';
import {IPassesState} from './passes.state';

export const getPassesState = (state: AppState) => state.passes;

export const getPassesEntities = adapter.getSelectors(getPassesState).selectEntities;
export const getPassesCollection = adapter.getSelectors(getPassesState).selectAll;
export const getTotalPasses = adapter.getSelectors(getPassesState).selectTotal;

export const getPassesLoaded = createSelector(
  getPassesState,
  (state: IPassesState) => state.loaded
);

export const getPassesLoading = createSelector(
  getPassesState,
  (state: IPassesState) => state.loading
);

export const getPassesNextUrl = createSelector(
  getPassesState,
  (state: IPassesState) => state.nextRequest
);

export const getMorePassesLoading = createSelector(
  getPassesState,
  (state: IPassesState) => state.moreLoading
);

export const getSortPassesLoading = createSelector(
  getPassesState,
  (state: IPassesState) => state.sortLoading
);

export const getSortPassesValue = createSelector(
  getPassesState,
  (state: IPassesState) => state.sortValue
);

export const getPassesTotalCount = createSelector(
  getPassesState,
  (state: IPassesState) => state.totalCount
);

