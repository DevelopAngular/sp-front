import {createSelector} from '@ngrx/store';
import {getAccountsState, IAccountsState} from '../../../states';
import {adapter} from '../../admins/reducers';
import {TeachersStates} from './teachers.states';

export const getTeachersAccountsProfiles = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.teachersAccounts
);

export const getLoadedTeachers = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.loaded
);

export const getLoadingTeachers = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.loading
);

export const getNextRequestTeachers = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.nextRequest
);

export const getLastAddedTeachers = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.lastAddedTeachers
);

export const getTeacherSort = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.sortValue
);

export const getAddedTeacher = createSelector(
  getTeachersAccountsProfiles,
  (state: TeachersStates) => state.addedUser
);

export const getCountTeachers = adapter.getSelectors(getTeachersAccountsProfiles).selectTotal;
export const getTeachersAccountsEntities = adapter.getSelectors(getTeachersAccountsProfiles).selectEntities;

export const getTeacherAccountsCollection = adapter.getSelectors(getTeachersAccountsProfiles).selectAll;
