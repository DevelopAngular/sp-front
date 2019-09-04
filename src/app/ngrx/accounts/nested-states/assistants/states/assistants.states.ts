import {EntityState} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export interface AssistantsStates extends EntityState<User> {
  loading: boolean;
  loaded: boolean;
}

export const assistantsInitialState: AssistantsStates = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
};
