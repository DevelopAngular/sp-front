import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';

export interface IFromLocationState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
}
