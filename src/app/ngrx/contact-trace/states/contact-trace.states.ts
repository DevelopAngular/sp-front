import {EntityState} from '@ngrx/entity';
import {ContactTrace} from '../../../models/ContactTrace';

export interface IContactTraceStates extends EntityState<ContactTrace>{
  loading: boolean;
  loaded: boolean;
}
