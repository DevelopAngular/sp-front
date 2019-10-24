import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {PassStatsState} from './pass-stats.state';

export const getPassStatsState = (state: AppState) => state.passStats;

export const getPassStatsResult = createSelector(
  getPassStatsState,
  (state: PassStatsState) => state.data
);
