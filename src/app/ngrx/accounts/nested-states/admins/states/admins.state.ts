import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AdminsState extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
}

export const adminsInitialState: AdminsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};
