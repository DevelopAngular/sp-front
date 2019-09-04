import {Action, createReducer, on} from '@ngrx/store';
import {dashboardDataInitialState} from '../states';
import * as dashboardActions from '../actions';

const reducer = createReducer(
  dashboardDataInitialState,
  on(dashboardActions.getDashboardData, state => ({...state, loading: true, loaded: false})),
  on(dashboardActions.getDashboardDataSuccess, (state, {data}) => {
    return {
      ...state,
      data,
      loading: false,
      loaded: true
    };
  })
);

export function dashboardDataReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
