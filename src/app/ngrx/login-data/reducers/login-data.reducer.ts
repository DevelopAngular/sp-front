import {Action, createReducer, on} from '@ngrx/store';
import { ILoginDataState } from '../states';
import * as loginDataActions from '../actions';

const loginDataInitialState: ILoginDataState = {
  queryParams: []
};

const reducer = createReducer(
  loginDataInitialState,
  on(loginDataActions.setQueryParamsAction, (state, {queryParams}) => {
    return { ...state, queryParams };
  })
);


export function loginDataReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
