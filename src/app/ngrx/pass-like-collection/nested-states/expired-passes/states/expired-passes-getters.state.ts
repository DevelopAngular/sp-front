import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {IExpiredPassesState} from './expired passes.states';
import {adapter} from '../reducers';

export const getExpiredPassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.expiredPasses
);

export const getExpiredPassesLoading = createSelector(
  getExpiredPassesState,
  (state: IExpiredPassesState) => state.loading
);

export const getExpiredPassesLoaded = createSelector(
  getExpiredPassesState,
  (state: IExpiredPassesState) => state.loaded
);

export const getLastAddedExpiredPasses = createSelector(
  getExpiredPassesState,
  (state: IExpiredPassesState) => state.lastAddedPasses
);

export const getExpiredPassesCollection = adapter.getSelectors(getExpiredPassesState).selectAll;
export const getExpiredPassesTotalNumber = adapter.getSelectors(getExpiredPassesState).selectTotal;
