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
  on(userActions.getUser, state => ({...state, user: null, loading: true, loaded: false})),
  on(userActions.getUserSuccess, (state, {user}) => {
    return {
      ...state,
      user,
      loading: false,
      loaded: true
    };
  }),
  on(userActions.clearUser, state => ({...state, user: null, loaded: true, loading: false}))
);

export function userReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
