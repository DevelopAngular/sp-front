import {AppState} from '../../app-state/app-state';
import {schoolAdapter} from '../reducers';
import {createSelector} from '@ngrx/store';
import {SchoolsState} from './schools.state';

export const getSchoolsState = (state: AppState) => state.schools;

export const getSchoolsCollection = schoolAdapter.getSelectors(getSchoolsState).selectAll;
export const getSchoolsEntities = schoolAdapter.getSelectors(getSchoolsState).selectEntities;

export const getLoadedSchools = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.loaded
);

export const getGG4LInfoData = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.gg4lInfo
);

export const getSchoolSyncInfoData = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.syncInfo
);

export const getCurrentSchoolId = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.currentSchoolId
);

export const getCurrentSchool = createSelector(
  getSchoolsEntities,
  getCurrentSchoolId,
  (entities, id) => entities[id]
);

export const getGSuiteSyncInfoData = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.gSuiteInfo
);

export const getSchoolCleverInfo = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.cleverInfo
);

export const getSyncLoading = createSelector(
  getSchoolsState,
  (state: SchoolsState) => state.syncLoading
);

export const getSchoolsLength = schoolAdapter.getSelectors(getSchoolsState).selectTotal;
