import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IToLocationState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
