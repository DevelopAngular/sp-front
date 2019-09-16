import {EntityState} from '@ngrx/entity';
import {User} from '../../../models/User';

export interface UserState {
  user: User;
  loading: boolean;
  loaded: boolean;
}
