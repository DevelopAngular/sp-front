import { Action, createReducer, on } from '@ngrx/store';
import * as allAccountsActions from '../actions';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { User } from '../../../../../models/User';
import {AllAccountsState} from '../states';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const allAccountsInitialState: AllAccountsState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
    allAccountsInitialState,
    on(allAccountsActions.getAllAccounts,
      allAccountsActions.removeAllAccount,
        state => ({...state, loading: true, loaded: false})),
    on(allAccountsActions.getAllAccountsSuccess, (state, { accounts }) => {
      return adapter.addAll(accounts, {...state, loading: false, loaded: true });
    }),
    on(allAccountsActions.removeAllAccountSuccess, (state, {id}) => {
      return adapter.removeOne(+id, {...state, loading: false, loaded: true});
    })
);

export function allAccountsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
