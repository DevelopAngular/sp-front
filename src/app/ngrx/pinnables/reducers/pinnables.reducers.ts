import { Action, createReducer, on } from '@ngrx/store';
import {IPinnablesState} from '../states';
import * as pinnablesActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Pinnable} from '../../../models/Pinnable';

export const adapter: EntityAdapter<Pinnable> = createEntityAdapter<Pinnable>();

export const pinnablesInitialState: IPinnablesState = adapter.getInitialState({
  loading: false,
  loaded: false,
  currentPinnableId: null
});

const reducer = createReducer(
  pinnablesInitialState,
  on(pinnablesActions.getPinnables,
      state => ({...state, loading: true, loaded: false })),

  on(pinnablesActions.getSuccessPinnable, (state, { pinnables }) => {
    return adapter.addAll(pinnables, {...state, loading: false, loaded: true });
  }),
  on(pinnablesActions.postPinnablesSuccess, (state, { pinnable }) => {
    return adapter.addOne(pinnable, {...state, loading: false, loaded: true, currentPinnableId: pinnable.id});
  }),
  on(pinnablesActions.updatePinnableSuccess, (state, {pinnable}) => {
    return adapter.upsertOne(pinnable, {...state, loading: false, loaded: true, currentPinnableId: pinnable.id});
  }),
  on(pinnablesActions.removeSuccessPinnable, (state, { id }) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true, currentPinnableId: id});
  }),
  on(pinnablesActions.getPinnablesFailure, (state, {errorMessage}) => ({...state, loaded: true, loading: false}))
);

export function pinnablesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
