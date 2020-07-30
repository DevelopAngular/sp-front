import { EntityState } from '@ngrx/entity';
import { School } from '../../../models/School';
import { GG4LSync } from '../../../models/GG4LSync';
import { SchoolSyncInfo } from '../../../models/SchoolSyncInfo';
import { GSuiteOrgs } from '../../../models/GSuiteOrgs';

export interface SchoolsState extends EntityState<School> {
  loading: boolean;
  loaded: boolean;
  currentSchoolId: string | number;
  gg4lInfo: GG4LSync;
  syncInfo: SchoolSyncInfo;
  gSuiteInfo: GSuiteOrgs;
}
