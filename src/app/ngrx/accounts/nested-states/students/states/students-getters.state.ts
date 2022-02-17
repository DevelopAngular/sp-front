import {createSelector} from '@ngrx/store';
import {getAccountsState, IAccountsState} from '../../../states';
import {adapter} from '../reducers';
import {StudentsStates} from './students.states';


export const getStudentsAccountsProfiles = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.studentsAccounts
);

export const getLoadedStudents = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.loaded
);

export const getLoadingStudents = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.loading
);

export const getNextRequestStudents = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.nextRequest
);

export const getLastAddedStudents = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => {
    return state.lastAddedStudents;
  }
);

export const getStudentSort = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.sortValue
);

export const getAddedStudent = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.addedUser
);

export const getCurrentUpdatedStudent = createSelector(
  getStudentsAccountsProfiles,
  (state: StudentsStates) => state.currentUpdatedAccount
);

export const getStudentsStats = createSelector(
  getStudentsAccountsProfiles,
  (state) => state.studentsStats
);

export const getStudentsStatsLoading = createSelector(
  getStudentsAccountsProfiles,
  (state) => state.statsLoading
);

export const getStudentsStatsLoaded = createSelector(
  getStudentsAccountsProfiles,
  (state) => state.statsLoaded
);

export const getCountStudents = adapter.getSelectors(getStudentsAccountsProfiles).selectTotal;
export const getStudentsAccountsEntities = adapter.getSelectors(getStudentsAccountsProfiles).selectEntities;

export const getStudentsAccountsCollection = adapter.getSelectors(getStudentsAccountsProfiles).selectAll;
