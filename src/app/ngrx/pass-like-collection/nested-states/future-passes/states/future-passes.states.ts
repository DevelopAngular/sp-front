import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IFuturePassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
