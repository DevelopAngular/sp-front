import {Pinnable} from '../../../models/Pinnable';
import {EntityState} from '@ngrx/entity';
import {adapter} from '../reducers';

export interface IPinnablesState extends EntityState<Pinnable> {
  loading: boolean;
  loaded: boolean;
  currentPinnableId: number | string;
}


// {
//   ids: [],
//   entities: {},
//   loading: false,
//   loaded: false,
//   currentPinnableId: null
// };

