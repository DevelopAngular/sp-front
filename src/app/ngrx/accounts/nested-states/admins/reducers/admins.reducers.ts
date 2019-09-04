import {Action, createReducer, on} from '@ngrx/store';
import {adminsInitialState} from '../states/admins.state';
import * as adminsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const reducer = createReducer(
  adminsInitialState,
  on(adminsActions.getAdmins,
    adminsActions.postAdmin,
    adminsActions.removeAdminAccount,
      state => ({...state, loading: true, loaded: false})),
  on(adminsActions.getAdminsSuccess, (state, {admins}) => {
    return adapter.addAll(admins, {...state, loading: false, loaded: true});
  }),
  on(adminsActions.removeAdminAccountSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
);

export function adminsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
