import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IMyRoomPassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
