import { EntityState } from '@ngrx/entity';
import { School } from '../../../models/School';

export interface SchoolsState extends EntityState<School> {
  loading: boolean;
  loaded: boolean;
  currentSchoolId: string | number;
}
