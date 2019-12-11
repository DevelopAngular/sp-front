import {Pinnable} from '../../../models/Pinnable';
import {EntityState} from '@ngrx/entity';

export interface IPinnablesState extends EntityState<Pinnable> {
  loading: boolean;
  loaded: boolean;
  arrangedLoading: boolean;
  currentPinnableId: number | string;
}

