import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AdminsState extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  nextRequest: string;
  lastAddedAdmins: User[];
  sortValue: string;
}

