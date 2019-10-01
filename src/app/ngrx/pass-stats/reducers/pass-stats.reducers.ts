import {Action, createReducer, on} from '@ngrx/store';
import {passStatsInitialState} from '../state';
import * as statsActions from '../actions';

const reducer = createReducer(
  passStatsInitialState,
  on(statsActions.getPassStats, state => ({...state, loading: true, loaded: false})),
  on(statsActions.getPassStatsSuccess, (state, {data}) => {
    return {
      ...state,
      data,
      loading: false,
      loaded: true
    };
  })
);

export function passStatsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
