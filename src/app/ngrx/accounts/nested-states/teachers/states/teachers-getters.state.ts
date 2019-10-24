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

export const getCountTeachers = adapter.getSelectors(getTeachersAccountsProfiles).selectTotal;

export const getTeacherAccountsCollection = adapter.getSelectors(getTeachersAccountsProfiles).selectAll;
