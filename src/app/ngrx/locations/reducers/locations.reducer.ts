import {Action, createReducer, on} from '@ngrx/store';
import { LocationsState } from '../states';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Location } from '../../../models/Location';
import * as locationsActions from '../actions';

export const locsAdapter: EntityAdapter<Location> = createEntityAdapter<Location>();
export const locationsInitialState: LocationsState = locsAdapter.getInitialState({
  loading: false,
  loaded: false,
  createdLocationId: null,
  updatedLocationId: null,
  foundLocations: []
});

const reducer = createReducer(
  locationsInitialState,
  on(locationsActions.getLocations,
     locationsActions.searchLocations,
     locationsActions.postLocation,
     locationsActions.updateLocation,
     locationsActions.removeLocation,
      state => ({...state, loading: true, loaded: false, createdLocationId: null, updatedLocationId: null})),
  on(locationsActions.getLocationsSuccess, (state, {locations}) => {
    return locsAdapter.addAll(locations, {...state, loading: false, loaded: true});
  }),
  on(locationsActions.searchLocationsSuccess, (state, {foundLocations}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      foundLocations
    };
  }),
  on(locationsActions.postLocationSuccess, (state, {location}) => {
    return locsAdapter.addOne(location, {...state, loading: false, loaded: true, createdLocationId: location.id});
  }),
  on(locationsActions.updateLocationSuccess, (state, {location}) => {
    return locsAdapter.upsertOne(location, {...state, loading: false, loaded: true, updatedLocationId: location.id});
  }),
  on(locationsActions.removeLocationSuccess, (state, {id}) => {
    return locsAdapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
);

export function locationsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
