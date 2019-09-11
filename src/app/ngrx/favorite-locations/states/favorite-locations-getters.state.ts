import { AppState } from '../../app-state/app-state';
import { favLocAdapter } from '../reducers';
import {createSelector} from '@ngrx/store';
import {FavoriteLocationsState} from './favorite-locations.state';

export const getFavoriteLocationsState = (state: AppState) => state.favoriteLocations;

export const getFavoriteLocationsCollection = favLocAdapter.getSelectors(getFavoriteLocationsState).selectAll;

export const getLoadingFavoriteLocations = createSelector(
  getFavoriteLocationsState,
  (state: FavoriteLocationsState) => state.loading
);

export const getLoadedFavoriteLocations = createSelector(
  getFavoriteLocationsState,
  (state: FavoriteLocationsState) => state.loaded
);
