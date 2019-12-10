import {UserState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as userActions from '../actions';

const userInitialState: UserState = {
  user: null,
  userPin: null,
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
  on(userActions.clearUser, state => ({...state, user: null, loaded: true, loading: false})),
  on(userActions.getUserPinSuccess, userActions.updateUserPinSuccess, (state, {pin}) => {
    return {
      ...state,
      userPin: pin
    };
  })
);

export function userReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
