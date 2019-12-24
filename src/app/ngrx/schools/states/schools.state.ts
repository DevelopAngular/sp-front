import { EntityState } from '@ngrx/entity';
import { School } from '../../../models/School';
import { GG4LSync } from '../../../models/GG4LSync';

export interface SchoolsState extends EntityState<School> {
  loading: boolean;
  loaded: boolean;
  currentSchoolId: string | number;
  gg4lInfo: GG4LSync;
}
