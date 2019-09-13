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
  on(schoolsActions.getSchools, state => ({...state, loading: true, loaded: false})),
  on(schoolsActions.getSchoolsSuccess, (state, {schools}) => {
    return schoolAdapter.addAll(schools, {...state, loading: false, loaded: true});
  })
);

export function schoolsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
