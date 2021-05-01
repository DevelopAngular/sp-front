import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {IFuturePassesState} from './future-passes.states';
import {adapter} from '../reducers';

export const getFuturePassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.futurePasses
);

export const getFuturePassesLoading = createSelector(
  getFuturePassesState,
  (state: IFuturePassesState) => state.loading
);

export const getFuturePassesLoaded = createSelector(
  getFuturePassesState,
  (state: IFuturePassesState) => state.loaded
);

export const getFuturePassesCollection = adapter.getSelectors(getFuturePassesState).selectAll;
export const getFuturePassesTotalNumber = adapter.getSelectors(getFuturePassesState).selectTotal;
