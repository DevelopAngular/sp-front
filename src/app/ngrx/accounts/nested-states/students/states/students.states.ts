import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface StudentsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  lastAddedStudents: User[];
  nextRequest: string;
  sortValue: string;
  addedUser: User;
  currentUpdatedAccount: User;
}
