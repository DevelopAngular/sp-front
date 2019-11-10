import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ColorProfile} from '../../../models/ColorProfile';
import {ColorsState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as colorsActions from '../actions';

export const colorAdapter: EntityAdapter<ColorProfile> = createEntityAdapter<ColorProfile>();

export const colorProfileInitialState: ColorsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};

const reducer = createReducer(
  colorProfileInitialState,
  on(colorsActions.getColorProfiles, state => ({...state, loading: true, loaded: false})),
  on(colorsActions.getColorProfilesSuccess, (state, {colors}) => {
    return colorAdapter.addAll(colors, {...state, loading: false, loaded: true});
  }),
  on(colorsActions.getColorProfilesFailure, state => ({...state, loading: false, loaded: true}))
);

export function colorsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
