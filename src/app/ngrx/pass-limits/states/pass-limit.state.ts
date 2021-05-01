import {EntityState} from '@ngrx/entity';
import {PassLimit} from '../../../models/PassLimit';

export interface IPassLimitState extends EntityState<PassLimit> {
  loading: boolean;
  loaded: boolean;
}
