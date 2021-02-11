import {Action, createReducer, on} from '@ngrx/store';
import {IRepresentedUsersState} from '../states';
import * as rUsersActions from '../actions';

export const rUsersInitialState: IRepresentedUsersState = {
  loaded: false,
  loading: false,
  rUsers: null,
  effectiveUser: null
};

const reducer = createReducer(
  rUsersInitialState,
  on(rUsersActions.getRUsers, (state) => ({...state, loading: true, loaded: false})),
  on(rUsersActions.getRUsersSuccess, (state, {rUsers}) => {
    return {...state, loading: false, loaded: true, rUsers, effectiveUser: rUsers[0]};
  }),
  on(rUsersActions.updateEffectiveUser, (state, {effectiveUser}) => {
    return { ...state, effectiveUser };
  }),
  on(rUsersActions.clearRUsers, (state) => {
    return { ...state, ...rUsersInitialState };
  })
);

export function representedUsersReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
