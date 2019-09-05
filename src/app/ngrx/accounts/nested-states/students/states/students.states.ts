import { EntityState } from '@ngrx/entity';
import { User } from '../../../../../models/User';

export interface StudentsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
}

export const studentsAccountsInitialState: StudentsStates = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};
