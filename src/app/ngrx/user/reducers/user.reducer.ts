import {UserState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as userActions from '../actions';

const userInitialState: UserState = {
  user: null,
  loading: false,
  loaded: false
};

const reducer = createReducer(
  userInitialState,
  on(userActions.getUser, state => ({...state, loading: true, loaded: false})),
  on(userActions.getUserSuccess, (state, {user}) => {
    return {
      ...state,
      user,
      loading: false,
      loaded: true
    };
  })
);

export function userReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
