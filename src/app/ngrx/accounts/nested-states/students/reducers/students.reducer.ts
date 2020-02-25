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
  lastAddedStudents: []
});

const reducer = createReducer(
  studentsAccountsInitialState,
  on(studentsActions.getStudents,
      studentsActions.removeStudent,
    studentsActions.getMoreStudents,
      state => ({ ...state, loading: true, loaded: false, lastAddedStudents: [] })),
  on(studentsActions.getStudentsSuccess, (state, { students, next }) => {
    return adapter.addAll(students, { ...state, loading: false, loaded: true, nextRequest: next });
  }),
  on(studentsActions.removeStudentSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(studentsActions.updateStudentActivitySuccess, (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true});
  }),
  on(studentsActions.getMoreStudentsSuccess, (state, {moreStudents, next}) => {
    return adapter.addMany(moreStudents, {...state, loading: false, loaded: true, nextRequest: next, lastAddedStudents: moreStudents});
  }),
  on(studentsActions.postStudentSuccess, (state, {student}) => {
    return adapter.addOne(student, {...state, loading: false, loaded: true});
  })
);

export function studentsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}



