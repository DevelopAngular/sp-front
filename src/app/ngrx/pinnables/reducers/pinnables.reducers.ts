import { Action, createReducer, on } from '@ngrx/store';
import { pinnablesInitialState } from '../states';
import * as pinnablesActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Pinnable} from '../../../models/Pinnable';

export const adapter: EntityAdapter<Pinnable> = createEntityAdapter<Pinnable>();

const reducer = createReducer(
  pinnablesInitialState,
  on(pinnablesActions.getPinnables,
      state => ({...state, loading: true, loaded: false, currentPinnableId: null})),

  on(pinnablesActions.getSuccessPinnable, (state, { pinnables }) => {

    return adapter.addAll(pinnables, {...state, loading: false, loaded: true, currentPinnableId: null});
  }),
  on(pinnablesActions.postPinnablesSuccess, (state, { pinnable }) => {
    return adapter.addOne(pinnable, {...state, loading: false, loaded: true, currentPinnableId: pinnable.id});
  }),
  on(pinnablesActions.updatePinnableSuccess, (state, {pinnable}) => {
    return adapter.upsertOne(pinnable, {...state, loading: false, loaded: true, currentPinnableId: pinnable.id});
  }),
  on(pinnablesActions.removeSuccessPinnable, (state, { pinnable }) => {

    return adapter.removeOne(pinnable.id, {...state, loading: false, loaded: true, currentPinnableId: pinnable.id});

  })
);

export function pinnablesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
