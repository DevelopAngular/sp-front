import { Action, createReducer, on } from '@ngrx/store';
import * as allAccountsActions from '../actions';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { User } from '../../../../../models/User';
import {AllAccountsState} from '../states';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const allAccountsInitialState: AllAccountsState = adapter.getInitialState({
  loading: false,
  loaded: false,
  lastAddedAccounts: null,
  nextRequest: null
});

const reducer = createReducer(
    allAccountsInitialState,
    on(allAccountsActions.getAllAccounts,
      allAccountsActions.removeAllAccount,
        state => ({...state, loading: true, loaded: false, nextRequest: null, lastAddedAccounts: null})),
    on(allAccountsActions.getAllAccountsSuccess, (state, { accounts, next }) => {
      return adapter.addAll(accounts, {...state, loading: false, loaded: true, nextRequest: next });
    }),
    on(allAccountsActions.removeAllAccountSuccess, (state, {id}) => {
      return adapter.removeOne(+id, {...state, loading: false, loaded: true});
    }),
    on(allAccountsActions.getMoreAccountsSuccess, (state, { moreAccounts, next}) => {
      return adapter.addMany(moreAccounts,
        {...state, loading: false, loaded: true, nextRequest: next, lastAddedAccounts: moreAccounts });
    })
);

export function allAccountsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
