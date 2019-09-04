import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import * as studentsActions from '../actions';
import {studentsAccountsInitialState} from '../states';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const reducer = createReducer(
  studentsAccountsInitialState,
  on(studentsActions.getStudents,
      studentsActions.removeStudent,
      state => ({ ...state, loading: true, loaded: false })),
  on(studentsActions.getStudentsSuccess, (state, { students }) => {
    return adapter.addAll(students, { ...state, loading: false, loaded: true });
  }),
  on(studentsActions.removeStudentSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
);

export function studentsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}



