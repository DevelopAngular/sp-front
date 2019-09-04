import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {DashboardState} from './dashboard.state';

export const getDashboardDataState = (state: AppState) => state.dashboard;

export const getDashboardDataResult = createSelector(
  getDashboardDataState,
  (state: DashboardState) => state.data
);
