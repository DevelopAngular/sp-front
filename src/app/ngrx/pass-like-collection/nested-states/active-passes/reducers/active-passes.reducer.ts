import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IActivePassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as activePassesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const activePassesInitialState: IActivePassesState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  activePassesInitialState,
  on(activePassesActions.getActivePasses, (state) => ({...state, loading: true, loaded: false})),
  on(activePassesActions.getActivePassesSuccess, (state, {activePasses}) => {
    return adapter.addAll(activePasses, {...state, loading: false, loaded: true});
  })
);

export function activePassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
