import {AppState} from '../../app-state/app-state';
import {adapter} from '../reducers';
import {createSelector} from '@ngrx/store';
import {ReportsState} from './reports.state';

export const getReportsState = (state: AppState) => state.reports;

export const getReportsCollection = adapter.getSelectors(getReportsState).selectAll;
export const getReportsLength = adapter.getSelectors(getReportsState).selectTotal;
export const getReportsEntities = adapter.getSelectors(getReportsState).selectEntities;

export const getIsLoadedReports = createSelector(
  getReportsState,
  (state: ReportsState) => state.loaded
);

export const getIsLoadingReports = createSelector(
  getReportsState,
  (state: ReportsState) => state.loading
);

export const getFoundReports = createSelector(
  getReportsState,
  (state: ReportsState) => state.reportsFound
);

export const getAddedReports = createSelector(
  getReportsState,
  (state: ReportsState) => state.addedReports
);

export const getReportsNextUrl = createSelector(
  getReportsState,
  (state: ReportsState) => state.next
);

export const getCurrentReportId = createSelector(
  getReportsState,
  (state:  ReportsState) => state.currentReportId
);

/*export const getCurrentReport = createSelector(
  getReportsEntities,
  getCurrentReportId,
  (entities, id) => entities[id]
);*/
