import {Action, createReducer, on} from '@ngrx/store';
import {ILoginDataState} from '../states';
import * as loginDataActions from '../actions';

const loginDataInitialState: ILoginDataState = {
  queryParams: [],
  urlAfterLogin: null
};

const reducer = createReducer(
  loginDataInitialState,
  on(loginDataActions.setQueryParamsAction, (state, {queryParams}) => {
    return { ...state, queryParams };
  }),
  on(loginDataActions.setUrlAfterLogin, (state, {url}) => {
    return { ...state, urlAfterLogin: url };
  })
);


export function loginDataReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
