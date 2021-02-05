import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {IFromLocationState} from './from-location.state';
import {adapter} from '../reducers';

export const getFromLocationPassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.fromLocation
);

export const getFromLocationLoading = createSelector(
  getFromLocationPassesState,
  (state: IFromLocationState) => state.loading
);

export const getFromLocationLoaded = createSelector(
  getFromLocationPassesState,
  (state: IFromLocationState) => state.loaded
);

export const getFromLocationPassesCollection = adapter.getSelectors(getFromLocationPassesState).selectAll;
export const getFromLocationPassesTotalNumber = adapter.getSelectors(getFromLocationPassesState).selectTotal;
