import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IActivePassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
