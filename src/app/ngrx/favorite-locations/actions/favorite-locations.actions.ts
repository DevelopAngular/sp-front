import {createAction, props} from '@ngrx/store';
import {Location} from '../../../models/Location';

const COMPONENT = 'Favorite Locations';

export const getFavoriteLocations = createAction(`[${COMPONENT}] Get Favorite Locations`);
export const getFavoriteLocationsSuccess = createAction(`[${COMPONENT}] Get Favorite Locations Success`, props<{locations: Location[]}>());
export const getFavoriteLocationsFailure = createAction(`[${COMPONENT}] Get Favorite Locations Failure`, props<{errorMessage: string}>());

export const updateFavoriteLocations = createAction(`[${COMPONENT}] Update Favorite Locations`, props<{locations: Location[]}>());
export const updateFavoriteLocationsSuccess = createAction(`[${COMPONENT}] Update Favorite Locations Success`, props<{locations: Location[]}>());
export const updateFavoriteLocationsFailure = createAction(`[${COMPONENT}] Update Favorite Locations Failure`, props<{errorMessage: string}>());


