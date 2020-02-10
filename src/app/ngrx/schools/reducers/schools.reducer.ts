import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { School } from '../../../models/School';
import { SchoolsState } from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as schoolsActions from '../actions';

export const schoolAdapter: EntityAdapter<School> = createEntityAdapter<School>();
export const schoolsInitialState: SchoolsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false,
  currentSchoolId: null
};

const reducer = createReducer(
  schoolsInitialState,
  on(schoolsActions.getSchools,
      schoolsActions.updateSchool,
      state => ({...state, loading: true, loaded: false, currentSchoolId: null})),
  on(schoolsActions.getSchoolsSuccess, (state, {schools}) => {
    return schoolAdapter.addAll(schools, {...state, loading: false, loaded: true});
  }),
  on(schoolsActions.updateSchoolSuccess, (state, {school}) => {
    return schoolAdapter.upsertOne(school, { ...state, loading: false, loaded: true, currentSchoolId: school.id });
  })
);

export function schoolsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
