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

export const getCountStudents = adapter.getSelectors(getStudentsAccountsProfiles).selectTotal;

export const getStudentsAccountsCollection = adapter.getSelectors(getStudentsAccountsProfiles).selectAll;
