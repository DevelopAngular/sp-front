import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {IActivePassesState} from './active-passes.state';
import {adapter} from '../reducers';

export const getActivePassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.activePasses
);

export const getActivePassesLoading = createSelector(
  getActivePassesState,
  (state: IActivePassesState) => state.loading
);

export const getActivePassesLoaded = createSelector(
  getActivePassesState,
  (state: IActivePassesState) => state.loaded
);

export const getActivePassesCollection = adapter.getSelectors(getActivePassesState).selectAll;
export const getActivePassesTotalNumber = adapter.getSelectors(getActivePassesState).selectTotal;
