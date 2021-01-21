import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IFiltersState} from './filters.state';

export const getFilterState = (state: AppState) => state.pass_filters;

export const getFiltersData = createSelector(
  getFilterState,
  (state: IFiltersState) => state.filters
);

export const getFiltersDataLoading = createSelector(
  getFilterState,
  (state: IFiltersState) => state.loading
);
