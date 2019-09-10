import {EntityState} from '@ngrx/entity';
import {Location} from '../../../models/Location';

export interface LocationsState extends EntityState<Location> {
  loading: boolean;
  loaded: boolean;
  currentLocationId: string | number;
  foundLocations: Location[];
}
