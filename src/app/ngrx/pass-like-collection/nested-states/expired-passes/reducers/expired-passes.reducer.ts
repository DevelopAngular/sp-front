import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IExpiredPassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as expiredPassesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const expiredPassesInitialState: IExpiredPassesState = adapter.getInitialState({
  loading: false,
  loaded: false,
  lastAddedPasses: null
});

const reducer = createReducer(
  expiredPassesInitialState,
  on(expiredPassesActions.getExpiredPasses, (state) => ({...state, loading: true, loaded: false})),
  on(expiredPassesActions.getExpiredPassesSuccess, (state, {expiredPasses}) => {
    return adapter.addAll(expiredPasses, {...state, loading: false, loaded: true});
  }),
  on(expiredPassesActions.getMoreExpiredPassesSuccess, (state, {passes}) => {
    return adapter.addMany(passes, {...state, loading: false, loaded: true});
  }),
  on(expiredPassesActions.clearExpiredPasses, (state) => {
    return {...state, ...expiredPassesInitialState };
  })
);

export function expiredPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
