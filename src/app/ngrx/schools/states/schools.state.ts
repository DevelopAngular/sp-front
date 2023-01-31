import { EntityState } from '@ngrx/entity';
import { School } from '../../../models/School';
import { SchoolSyncInfo } from '../../../models/SchoolSyncInfo';
import { GSuiteOrgs } from '../../../models/GSuiteOrgs';
import { CleverInfo } from '../../../models/CleverInfo';
import { ClassLinkInfo } from '../../../models/ClassLinkInfo';

export interface SchoolsState extends EntityState<School> {
	loading: boolean;
	loaded: boolean;
	currentSchoolId: string | number;
	syncInfo: SchoolSyncInfo;
	gSuiteInfo: GSuiteOrgs;
	cleverInfo: CleverInfo;
	syncLoading: boolean;
	syncLoaded: boolean;
	classLinkInfo: ClassLinkInfo;
}
