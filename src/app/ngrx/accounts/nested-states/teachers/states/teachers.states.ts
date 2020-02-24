import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface TeachersStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  nextRequest: string;
  lastAddedTeachers: User[];
}

