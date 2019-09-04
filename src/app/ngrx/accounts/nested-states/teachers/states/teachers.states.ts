import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface TeachersStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
}

export const teachersInitialState: TeachersStates = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};
