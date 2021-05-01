import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IFromLocationState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as fromLocationActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const fromLocationPassesInitialState: IFromLocationState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  fromLocationPassesInitialState,
  on(fromLocationActions.getFromLocationPasses, (state) => ({...state, loading: true, loaded: false})),
  on(fromLocationActions.getFromLocationPassesSuccess, (state, {fromLocationPasses}) => {
    return adapter.addAll(fromLocationPasses, {...state, loading: false, loaded: true});
  })
);

export function fromLocationPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
