import {Action, createReducer, on} from '@ngrx/store';
import {countAccountsinitialState} from '../state';
import * as countActions from '../actions';

const reducer = createReducer(
  countAccountsinitialState,
  on(countActions.getCountAccounts, state => ({...state, loading: true, loaded: false})),
  on(countActions.getCountAccountsSuccess, (state, {countData}) => {
    return {
      ...state,
      countData,
      loading: false,
      loaded: true
    };
})
);

export function countAccountsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
