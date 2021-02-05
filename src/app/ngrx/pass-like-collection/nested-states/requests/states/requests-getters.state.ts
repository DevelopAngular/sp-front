import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IRequestsState} from './requests.states';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {adapter} from '../reducers';

export const getRequestsState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.requests
);

export const getRequestsLoading = createSelector(
  getRequestsState,
  (state: IRequestsState) => state.loading
);

export const getRequestsLoaded = createSelector(
  getRequestsState,
  (state: IRequestsState) => state.loaded
);

export const getRequestsCollection = adapter.getSelectors(getRequestsState).selectAll;
export const getRequestsTotalNumber = adapter.getSelectors(getRequestsState).selectTotal;
