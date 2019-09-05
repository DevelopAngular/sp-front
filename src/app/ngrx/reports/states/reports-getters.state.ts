import { AppState } from '../../app-state/app-state';
import {adapter} from '../reducers';
import {createSelector} from '@ngrx/store';
import {IGetReportsRequest} from './reports.state';

export const getReportsState = (state: AppState) => state.reports;

export const getReportsCollection = adapter.getSelectors(getReportsState).selectAll;

export const getIsLoadedReports = createSelector(
  getReportsState,
  (state: IGetReportsRequest) => state.loaded
);

export const getIsLoadingReports = createSelector(
  getReportsState,
  (state: IGetReportsRequest) => state.loading
);

export const getFoundReports = createSelector(
  getReportsState,
  (state: IGetReportsRequest) => state.reportsFound
);



