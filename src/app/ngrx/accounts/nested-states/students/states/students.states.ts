import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';
import {UserStats} from '../../../../../models/UserStats';

export interface StudentsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  lastAddedStudents: User[];
  nextRequest: string;
  sortValue: string;
  addedUser: User;
  currentUpdatedAccount: User;
  studentsStats: {[id: string]: UserStats};
  statsLoading: boolean;
  statsLoaded: boolean;
}
