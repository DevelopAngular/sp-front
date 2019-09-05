import { Action, createReducer, on } from '@ngrx/store';
import {locsInitialState} from '../state';
import * as locsActions from '../actions';
import {Location} from '../../../models/Location';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';

export const adapter: EntityAdapter<Location> = createEntityAdapter<Location>();


const reducer = createReducer(
  locsInitialState,
  on(locsActions.getLocsWithTeachers, state => ({...state, loading: true, loaded: false})),
  on(locsActions.getLocsWithTeachersSuccess, (state, { locs }) => {
    return adapter.addAll(locs, {...state, loading: false, loaded: true });
  })
);

export function locationsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
