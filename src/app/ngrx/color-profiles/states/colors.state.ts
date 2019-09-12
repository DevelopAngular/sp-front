import {EntityState} from '@ngrx/entity';
import {ColorProfile} from '../../../models/ColorProfile';

export interface ColorsState extends EntityState<ColorProfile> {
  loading: boolean;
  loaded: boolean;
}
