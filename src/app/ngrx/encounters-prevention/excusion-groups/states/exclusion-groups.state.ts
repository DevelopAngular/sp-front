import {EntityState} from '@ngrx/entity';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

export interface IExclusionGroupsState extends EntityState<ExclusionGroup> {
  loading: boolean;
  loaded: boolean;
}
