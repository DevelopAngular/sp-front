import { EntityState } from '@ngrx/entity';
import { Location } from '../../../models/Location';

export interface FavoriteLocationsState extends EntityState<Location> {
  loading: boolean;
  loaded: boolean;
}
