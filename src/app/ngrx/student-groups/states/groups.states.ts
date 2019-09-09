import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {StudentList} from '../../../models/StudentList';

export interface GroupsStates extends EntityState<StudentList> {
  loading: boolean;
  loaded: boolean;
  currentGroupId: string | number;
}
