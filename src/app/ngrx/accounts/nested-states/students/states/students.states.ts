import { EntityState } from '@ngrx/entity';
import { User } from '../../../../../models/User';

export interface StudentsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  lastAddedStudents: any;
  nextRequest: string;
}
