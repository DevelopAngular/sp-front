import { EntityState } from '@ngrx/entity';
import { HallPass } from '../../../models/HallPass';

export interface IPassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
  nextRequest: string;
  lastAddedPasses: HallPass[];
}
