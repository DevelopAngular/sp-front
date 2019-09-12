import { AppState } from '../../app-state/app-state';
import { locsAdapter } from '../reducers';
import { createSelector } from '@ngrx/store';
import { LocationsState } from './locations.state';

export const getLocationsState = (state: AppState) => state.locations;

export const getLocationsCollection = locsAdapter.getSelectors(getLocationsState).selectAll;

export const getFoundLocations = createSelector(
  getLocationsState,
  (state: LocationsState) => state.foundLocations
);

export const getLoadingLocations = createSelector(
  getLocationsState,
  (state: LocationsState) => state.loading
);

export const getLoadedLocations = createSelector(
  getLocationsState,
  (state: LocationsState) => state.loaded
);

export const getLocationsEntities = locsAdapter.getSelectors(getLocationsState).selectEntities;

export const getCreatedLocationId = createSelector(
  getLocationsState,
  (state: LocationsState) => state.createdLocationId
);

export const getUpdatedLocationId = createSelector(
  getLocationsState,
  (state: LocationsState) => state.updatedLocationId
);

export const getCreatedLocation = createSelector(
  getLocationsEntities,
  getCreatedLocationId,
  (entities, id) => {
    return entities[id];
  }
);

export const getUpdatedLocation = createSelector(
  getLocationsEntities,
  getCreatedLocationId,
  (entities, id) => {
    return entities[id];
  }
);
