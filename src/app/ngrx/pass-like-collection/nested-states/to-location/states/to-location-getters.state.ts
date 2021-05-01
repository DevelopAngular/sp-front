import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {IToLocationState} from './to-location.state';
import {adapter} from '../reducers';

export const getToLocationPassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.toLocation
);

export const getToLocationLoading = createSelector(
  getToLocationPassesState,
  (state: IToLocationState) => state.loading
);

export const getToLocationLoaded = createSelector(
  getToLocationPassesState,
  (state: IToLocationState) => state.loaded
);

export const getToLocationPassesCollection = adapter.getSelectors(getToLocationPassesState).selectAll;
export const getToLocationPassesTotalNumber = adapter.getSelectors(getToLocationPassesState).selectTotal;
