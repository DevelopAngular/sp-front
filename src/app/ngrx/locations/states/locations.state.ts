import {EntityState} from '@ngrx/entity';
import {Location} from '../../../models/Location';

export interface LocationsState extends EntityState<Location> {
  loading: boolean;
  loaded: boolean;
  createdLocationId: string | number;
  updatedLocationId: string | number;
  foundLocations: Location[];
  fromCategory: Location[];
}
