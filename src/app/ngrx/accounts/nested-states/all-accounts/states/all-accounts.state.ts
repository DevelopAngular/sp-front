import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AllAccountsState extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  nextRequest: string;
}


