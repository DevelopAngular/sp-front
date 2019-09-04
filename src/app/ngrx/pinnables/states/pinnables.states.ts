import {Pinnable} from '../../../models/Pinnable';
import {EntityState} from '@ngrx/entity';

export interface IPinnablesState extends EntityState<Pinnable> {
  loading: boolean;
  loaded: boolean;
  currentPinnableId: number | string;
}

export const pinnablesInitialState: IPinnablesState = {
  ids: [],
  entities: {},
  loading: false,
  loaded: false,
  currentPinnableId: null
};

