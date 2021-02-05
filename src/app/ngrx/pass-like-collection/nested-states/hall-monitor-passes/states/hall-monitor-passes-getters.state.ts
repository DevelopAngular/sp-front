import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';
import {adapter} from '../reducers';
import {IHallMonitorPassesState} from './hall-monitor-passes.state';

export const getHallMonitorPassesState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.hallMonitorPasses
);

export const getHallMonitorPassesLoading = createSelector(
  getHallMonitorPassesState,
  (state: IHallMonitorPassesState) => state.loading
);

export const getHallMonitorPassesLoaded = createSelector(
  getHallMonitorPassesState,
  (state: IHallMonitorPassesState) => state.loaded
);

export const getHallMonitorPassesCollection = adapter.getSelectors(getHallMonitorPassesState).selectAll;
export const getHallMonitorPassesTotalNumber = adapter.getSelectors(getHallMonitorPassesState).selectTotal;
