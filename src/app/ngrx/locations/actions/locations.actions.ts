import { createAction, props } from '@ngrx/store';
import { Location } from '../../../models/Location';

const COMPONENT = 'Locations';

export const getLocations = createAction(`[${COMPONENT}] Get Locations`, props<{url: string}>());
export const getLocationsSuccess = createAction(`[${COMPONENT}] Get Locations Success`, props<{locations: Location[]}>());
export const getLocationsFailure = createAction(`[${COMPONENT}] Get Locations Failure`, props<{errorMessage: string}>());

export const getLocationsFromCategory = createAction(`[${COMPONENT}] Get Locations From Category`, props<{url: string}>());
export const getLocationsFromCategorySuccess = createAction(`[${COMPONENT}] Get Locations From Category Success`, props<{locations: Location[]}>());
export const getLocationsFromCategoryFailure = createAction(`[${COMPONENT}] Get Locations From Category Failure`, props<{errorMessage: string}>());

export const searchLocations = createAction(`[${COMPONENT}] Search Locations`, props<{url: string}>());
export const searchLocationsSuccess = createAction(`[${COMPONENT}] Search Locations Success`, props<{foundLocations: Location[]}>());
export const searchLocationsFailure = createAction(`[${COMPONENT}] Search Locations Failure`, props<{errorMessage: string}>());

export const postLocation = createAction(`[${COMPONENT}] Post Location`, props<{data: any}>());
export const postLocationSuccess = createAction(`[${COMPONENT}] Post Location Success`, props<{location: Location}>());
export const postLocationFailure = createAction(`[${COMPONENT}] Post Location Failure`, props<{errorMessage: string}>());

export const updateLocation = createAction(`[${COMPONENT}] Update Location`, props<{id: string | number, data: any}>());
export const updateLocationSuccess = createAction(`[${COMPONENT}] Update Location Success`, props<{location: Location}>());
export const updateLocationFailure = createAction(`[${COMPONENT}] Update Location Failure`, props<{errorMessage: string}>());

export const removeLocation = createAction(`[${COMPONENT}] Remove Location`, props<{id: string | number}>());
export const removeLocationSuccess = createAction(`[${COMPONENT}] Remove Location Success`, props<{id: string | number}>());
export const removeLocationFailure = createAction(`[${COMPONENT}] Remove Location Failure`, props<{errorMessage: string}>());



