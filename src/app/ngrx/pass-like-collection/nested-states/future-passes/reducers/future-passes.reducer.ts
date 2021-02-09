import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IFuturePassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as futurePassesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const futurePassesInitialState: IFuturePassesState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  futurePassesInitialState,
  on(futurePassesActions.getFuturePasses, (state) => ({...state, loading: true, loaded: false})),
  on(futurePassesActions.getFuturePassesSuccess, (state, {futurePasses}) => {
    return adapter.addAll(futurePasses, {...state, loading: false, loaded: true});
  })
);

export function futurePassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
