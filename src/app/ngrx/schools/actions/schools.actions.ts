import {createAction, props} from '@ngrx/store';
import {School} from '../../../models/School';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {CleverInfo} from '../../../models/CleverInfo';

const COMPONENT = 'Schools';

export const getSchools = createAction(`[${COMPONENT}] Get Schools`);
export const getSchoolsSuccess = createAction(`[${COMPONENT}] Get Schools Success`, props<{schools: School[]}>());
export const getSchoolsFailure = createAction(`[${COMPONENT}] Get Schools Failure`, props<{errorMessage: string}>());

export const updateSchool = createAction(`[${COMPONENT}] Update School`, props<{school: School, fields: any}>());
export const updateSchoolSuccess = createAction(`[${COMPONENT}] Update School Success`, props<{school: School}>());
export const updateSchoolFailure = createAction(`[${COMPONENT}] Update School Failure`, props<{errorMessage: string}>());

export const errorToastSuccess = createAction(`[${COMPONENT}] Error school Toast`);

export const getSchoolSyncInfo = createAction(`[${COMPONENT}] Get School Sync info`);
export const getSchoolSyncInfoSuccess = createAction(`[${COMPONENT}] Get School Sync info Success`, props<{syncInfo: SchoolSyncInfo}>());
export const getSchoolSyncInfoFailure = createAction(`[${COMPONENT}] Get School Sync info Failure`, props<{errorMessage: string}>());

export const updateSchoolSyncInfo = createAction(`[${COMPONENT}] Update School Sync info`, props<{data: any}>());
export const updateSchoolSyncInfoSuccess = createAction(`[${COMPONENT}] Update School Sync info Success`, props<{syncInfo: SchoolSyncInfo}>());
export const updateSchoolSyncInfoFailure = createAction(`[${COMPONENT}] Update School Sync info Failure`, props<{errorMessage: string}>());

export const getSchoolsGG4LInfo = createAction(`[${COMPONENT}] Get GG4L Info`);
export const getSchoolsGG4LInfoSuccess = createAction(`[${COMPONENT}] Get GG4L Info Success`, props<{gg4lInfo: GG4LSync}>());
export const getSchoolsGG4LInfoFailure = createAction(`[${COMPONENT}] Get GG4L Info Failure`, props<{errorMessage: string}>());

export const updateSchoolsGG4LInfo = createAction(`[${COMPONENT}] Update GG4L Info`, props<{data: any}>());
export const updateSchoolsGG4LInfoSuccess = createAction(`[${COMPONENT}] Update GG4L Info Success`, props<{gg4lInfo: GG4LSync}>());
export const updateSchoolsGG4LInfoFailure = createAction(`[${COMPONENT}] Update GG4L Info Failure`, props<{errorMessage: string}>());

export const getGSuiteSyncInfo = createAction(`[${COMPONENT}] Get GSuite Info`);
export const getGSuiteSyncInfoSuccess = createAction(`[${COMPONENT}] Get GSuite Info Success`, props<{gSuiteInfo: GSuiteOrgs}>());
export const getGSuiteSyncInfoFailure = createAction(`[${COMPONENT}] Get GSuite Info Failure`, props<{errorMessage: string}>());

export const updateGSuiteInfoSelectors = createAction(`[${COMPONENT}] Update GSuite Selectors`, props<{selectors: any}>());
export const updateGSuiteInfoSelectorsSuccess = createAction(`[${COMPONENT}] Update GSuite Selectors Success`, props<{selectors: any}>());

export const getCleverInfo = createAction(`[${COMPONENT}] Get Clever Info`);
export const getCleverInfoSuccess = createAction(`[${COMPONENT}] Get Clever Info Success`, props<{cleverInfo: CleverInfo}>());
export const getCleverInfoFailure = createAction(`[${COMPONENT}] Get Clever Info Failure`, props<{errorMessage: string}>());

export const syncClever = createAction(`[${COMPONENT}] Sync Clever`);

export const syncGsuite = createAction(`[${COMPONENT}] Sync Gsuite`);
export const syncGsuiteSuccess = createAction(`[${COMPONENT}] Sync Gsuite Success`, props<{data: any}>());
export const syncGsuiteFailure = createAction(`[${COMPONENT}] Sync Gsuite Failure`, props<{errorMessage: string}>());

export const updateCleverInfo = createAction(`[${COMPONENT}] Update Clever Info`, props<{cleverInfo: CleverInfo}>());
export const updateGSuiteInfo = createAction(`[${COMPONENT}] Update GsuiteInfo`, props<{gsuiteInfo: GSuiteOrgs}>());

export const clearSchools = createAction(`[${COMPONENT}] Clear Schools`);

