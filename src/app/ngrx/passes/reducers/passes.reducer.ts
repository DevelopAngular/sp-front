import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { HallPass } from '../../../models/HallPass';
import { IPassesState } from '../states';
import { Action, createReducer, on } from '@ngrx/store';

import * as passesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const passesInitialState: IPassesState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  passesInitialState,
  on(passesActions.searchPasses, state => ({...state, loading: true, loaded: false})),
  on(passesActions.searchPassesSuccess, (state, {passes}) => {
    return adapter.addAll(passes, {...state, loading: false, loaded: true});
  })
);


export function passesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
