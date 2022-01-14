import {EntityState} from '@ngrx/entity';
import {HallPass} from '../../../models/HallPass';

export interface IPassesState extends EntityState<HallPass> {
  loading: boolean;
  loaded: boolean;
  moreLoading: boolean;
  nextRequest: string;
  lastAddedPasses: HallPass[];
  sortLoading: boolean;
  sortLoaded: boolean;
  sortValue: string;
  totalCount: number;
  startPassLoading: boolean;
}
