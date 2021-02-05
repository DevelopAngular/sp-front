import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IHallMonitorPassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
