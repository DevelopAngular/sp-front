import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IExpiredPassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
