import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import * as studentsActions from '../actions';
import {StudentsStates} from '../states';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const studentsAccountsInitialState: StudentsStates = adapter.getInitialState({
  loading: false,
  loaded: false,
  nextRequest: null,
  lastAddedStudents: [],
  sortValue: '',
  addedUser: null,
  currentUpdatedAccount: null,
  studentsStats: {},
  statsLoading: false,
  statsLoaded: false,
});

const reducer = createReducer(
  studentsAccountsInitialState,
  on(studentsActions.getStudents,
      // studentsActions.removeStudent,
    // studentsActions.getMoreStudents,
      state => ({ ...state, loading: true, loaded: false, lastAddedStudents: [] })),
  on(studentsActions.getStudentsSuccess, (state, { students, next }) => {
    return adapter.addAll(students, { ...state, loading: false, loaded: true, nextRequest: next });
  }),
  on(studentsActions.removeStudentSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(studentsActions.updateStudentActivitySuccess,
    studentsActions.updateStudentAccount,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true, currentUpdatedAccount: profile});
  }),
  on(studentsActions.getMoreStudentsSuccess, (state, {moreStudents, next}) => {
    return adapter.addMany(moreStudents, {...state, loading: false, loaded: true, nextRequest: next, lastAddedStudents: moreStudents});
  }),
  on(studentsActions.postStudentSuccess, studentsActions.addUserToStudentProfileSuccess, (state, {student}) => {
    return adapter.addOne(student, {...state, loading: false, loaded: true, addedUser: student});
  }),
  on(studentsActions.getMoreStudentsFailure, (state, {errorMessage}) => ({...state, loading: false, loaded: true})),
  on(studentsActions.bulkAddStudentAccounts, (state, {students}) => {
    return adapter.addMany(students, {...state});
  }),
  on(studentsActions.sortStudentAccounts, (state, {students, next, sortValue}) => {
    return adapter.addAll(students, {...state, loading: false, loaded: true, nextRequest: next, sortValue});
  }),
  on(studentsActions.clearCurrentUpdatedStudent, (state) => ({...state, currentUpdatedAccount: null})),
  on(studentsActions.getStudentStats, (state) => ({...state, statsLoading: true, statsLoaded: false})),
  on(studentsActions.getStudentStatsSuccess, (state, {userId, stats}) => {
    return {...state, studentsStats: {...state.studentsStats, [userId]: stats}, statsLoading: false, statsLoaded: true};
  })
);

export function studentsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}



