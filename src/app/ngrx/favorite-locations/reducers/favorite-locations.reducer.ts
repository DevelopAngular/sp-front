import {createEntityAdapter} from '@ngrx/entity';
import {Location} from '../../../models/Location';
import {FavoriteLocationsState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as favLocActions from '../actions';

export const favLocAdapter = createEntityAdapter<Location>();

export const favoriteLocsInitialState: FavoriteLocationsState = {
  ids: [],
  entities: {},
  loading: false,
  loaded: false
};

const reducer = createReducer(
  favoriteLocsInitialState,
  on(favLocActions.getFavoriteLocations, state => ({...state, loading: true, loaded: false})),
  on(favLocActions.getFavoriteLocationsSuccess, (state, {locations}) => {
    return favLocAdapter.addAll(locations, {...state, loading: false, loaded: true});
  }),
  on(favLocActions.updateFavoriteLocationsSuccess, (state, {locations}) => {
    return favLocAdapter.upsertMany(locations, {...state, loading: false, loaded: true});
  })
);

export function favoriteLocationsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
