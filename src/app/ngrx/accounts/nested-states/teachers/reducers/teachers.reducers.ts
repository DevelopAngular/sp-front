import {Action, createReducer, on} from '@ngrx/store';
import {TeachersStates} from '../states';
import * as teachersActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const teachersInitialState: TeachersStates = adapter.getInitialState({
  loading: false,
  loaded: false,
  nextRequest: null,
  lastAddedTeachers: []
});

const reducer = createReducer(
  teachersInitialState,
  on(teachersActions.getTeachers,
    teachersActions.removeTeacher,
    (state) => ({...state, loading: true, loaded: false})),
  on(teachersActions.getTeachersSuccess, (state, {teachers, next}) => {
    return adapter.addAll(teachers, {...state, loading: false, loaded: true, nextRequest: next, lastAddedTeachers: []});
  }),
  on(teachersActions.removeTeacherSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(teachersActions.updateTeacherActivitySuccess,
    teachersActions.updateTeacherPermissionsSuccess,
    teachersActions.updateTeacherAccount,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true});
  }),
  on(teachersActions.getMoreTeachersSuccess, (state, {moreTeachers, next}) => {
    return adapter.addMany(moreTeachers, {...state, loading: false, loaded: true, nextRequest: next, lastAddedTeachers: moreTeachers});
  }),
  on(teachersActions.postTeacherSuccess, (state, {teacher}) => {
    return adapter.addOne(teacher, {...state, loading: false, loaded: true});
  })
);

export function teachersReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
