import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AssistantsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
  nextRequest: string;
  lastAddedAssistants: User[];
  sortValue: string;
}

