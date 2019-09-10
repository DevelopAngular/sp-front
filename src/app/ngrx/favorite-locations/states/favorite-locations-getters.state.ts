import { AppState } from '../../app-state/app-state';
import { favLocAdapter } from '../reducers';

export const getFavoriteLocationsState = (state: AppState) => state.favoriteLocations;

export const getFavoriteLocationsCollection = favLocAdapter.getSelectors(getFavoriteLocationsState).selectAll;
