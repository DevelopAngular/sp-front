import {Location} from '../../../models/Location';
import {EntityState} from '@ngrx/entity';

export interface LocationsState extends EntityState<Location> {
  loading: boolean;
  loaded: boolean;
}

export const locsInitialState: LocationsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false
}
