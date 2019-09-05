import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AllAccountsState extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
}

export const allAccountsInitialState: AllAccountsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};
