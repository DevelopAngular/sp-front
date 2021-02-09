import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IToLocationState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as toLocationActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const toLocationPassesInitialState: IToLocationState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  toLocationPassesInitialState,
  on(toLocationActions.getToLocationPasses, (state) => ({...state, loading: true, loaded: false})),
  on(toLocationActions.getToLocationPassesSuccess, (state, {toLocationPasses}) => {
    return adapter.addAll(toLocationPasses, {...state, loading: false, loaded: true});
  })
);

export function toLocationPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
