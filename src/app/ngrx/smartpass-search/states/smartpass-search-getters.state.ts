import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {ISmartpassSearchState} from './smartpass-search.state';

export const getSmartpassSearchGettersState = (state: AppState) => state.smartpassSearch;

export const getSmartpassSearchResult = createSelector(
  getSmartpassSearchGettersState,
  (state: ISmartpassSearchState) => state.searchResult
);

export const getResentSearch = createSelector(
  getSmartpassSearchGettersState,
  (state: ISmartpassSearchState) => state.recentSearch
);

export const getSmartpassSearchLoading = createSelector(
  getSmartpassSearchGettersState,
  (state: ISmartpassSearchState) => state.loading
);

export const getSmartpassSearchLoaded = createSelector(
  getSmartpassSearchGettersState,
  (state: ISmartpassSearchState) => state.loaded
);
