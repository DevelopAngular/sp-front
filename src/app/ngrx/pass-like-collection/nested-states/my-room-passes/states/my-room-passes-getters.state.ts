import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {adapter} from '../reducers';
import {IMyRoomPassesState} from './my-room-passes.state';

export const getMyRoomPassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.myRoomPasses
);

export const getMyRoomPassesLoading = createSelector(
  getMyRoomPassesState,
  (state: IMyRoomPassesState) => state.loading
);

export const getMyRoomPassesLoaded = createSelector(
  getMyRoomPassesState,
  (state: IMyRoomPassesState) => state.loaded
);

export const getMyRoomPassesCollection = adapter.getSelectors(getMyRoomPassesState).selectAll;
export const getMyRoomPassesTotalNumber = adapter.getSelectors(getMyRoomPassesState).selectTotal;
