import {Action, createReducer, on} from '@ngrx/store';
import {AdminsState} from '../states/admins.state';
import * as adminsActions from '../actions';
import {addUserToAdminProfileSuccess} from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const adminsInitialState: AdminsState = adapter.getInitialState({
  loading: false,
  loaded: false,
  nextRequest: null,
  lastAddedAdmins: [],
  sortValue: '',
  addedUser: null
});

const reducer = createReducer(
  adminsInitialState,
  on(adminsActions.getAdmins,
    // adminsActions.removeAdminAccount,
    // adminsActions.getMoreAdmins,
      state => ({...state, loading: true, loaded: false})),
  on(adminsActions.getAdminsSuccess, (state, {admins, next}) => {
    return adapter.addAll(admins, {...state, loading: false, loaded: true, nextRequest: next, lastAddedAdmins: []});
  }),
  on(adminsActions.removeAdminAccountSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(adminsActions.updateAdminActivitySuccess,
    adminsActions.updateAdminPermissionsSuccess,
    adminsActions.updateAdminAccount,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true});
  }),
  on(adminsActions.postAdminSuccess, addUserToAdminProfileSuccess, (state, {admin}) => {
    return adapter.addOne(admin, {...state, loading: false, loaded: true, addedUser: admin});
  }),
  on(adminsActions.getMoreAdminsSuccess, (state, {admins, next}) => {
    return adapter.addMany(admins, {...state, loading: false, loaded: true, nextRequest: next, lastAddedAdmins: admins});
  }),
  on(adminsActions.getMoreAdminsFailure, (state, {errorMessage}) => ({...state, loading: false, loaded: true})),
  on(adminsActions.bulkAddAdminAccounts, (state, {admins}) => {
    return adapter.addMany(admins, {...state});
  }),
  on(adminsActions.sortAdminAccounts, (state, {admins, next, sortValue}) => {
    return adapter.addAll(admins, {...state, loading: false, loaded: true, nextRequest: next, sortValue});
  })
);

export function adminsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
