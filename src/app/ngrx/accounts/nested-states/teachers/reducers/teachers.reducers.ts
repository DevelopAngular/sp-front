import {Action, createReducer, on} from '@ngrx/store';
import {TeachersStates} from '../states';
import * as teachersActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const teachersInitialState: TeachersStates = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  teachersInitialState,
  on(teachersActions.getTeachers,
    teachersActions.removeTeacher,
    (state) => ({...state, loading: true, loaded: false})),
  on(teachersActions.getTeachersSuccess, (state, {teachers}) => {
    return adapter.addAll(teachers, {...state, loading: false, loaded: true });
  }),
  on(teachersActions.removeTeacherSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
);

export function teachersReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
