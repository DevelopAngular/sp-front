import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {School} from '../../../models/School';
import {SchoolsState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as schoolsActions from '../actions';

export const schoolAdapter: EntityAdapter<School> = createEntityAdapter<School>();
export const schoolsInitialState: SchoolsState = {
  entities: {},
  ids: [],
  loading: false,
  loaded: false,
  currentSchoolId: null,
  syncInfo: null,
  gSuiteInfo: null,
  cleverInfo: null,
  syncLoading: false,
  syncLoaded: false,
  classLinkInfo: null,
};

const reducer = createReducer(
  schoolsInitialState,
  on(schoolsActions.getSchools,
      schoolsActions.updateSchool,
      state => ({...state, loading: true, loaded: false, currentSchoolId: null})),
  on(schoolsActions.getSchoolsSuccess, (state, {schools}) => {
    return schoolAdapter.addAll(schools, {...state, loading: false, loaded: true});
  }),
  on(schoolsActions.getSchoolSyncInfoSuccess,
    schoolsActions.updateSchoolSyncInfoSuccess,
    (state, {syncInfo}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      syncInfo
    };
  }),
  on(schoolsActions.updateSchoolSuccess, (state, {school}) => {
    return schoolAdapter.upsertOne(school, { ...state, loading: false, loaded: true, currentSchoolId: school.id });
  }),
  on(schoolsActions.getGSuiteSyncInfoSuccess, (state, {gSuiteInfo}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      gSuiteInfo
    };
  }),
  on(schoolsActions.updateGSuiteInfoSelectorsSuccess, (state, {selectors}) => {
    return {...state, gSuiteInfo: {...state.gSuiteInfo, selectors}};
  }),
  on(schoolsActions.getCleverInfoSuccess, (state, {cleverInfo}) => {
    return {...state, loaded: true, loading: false, cleverInfo};
  }),
  on(schoolsActions.getClassLinkSuccess, (state, {classLinkInfo}) => {
    return {...state, loaded: true, loading: false, classLinkInfo};
  }),
  on(
    schoolsActions.syncClever,
    schoolsActions.syncGsuite,
    (state) => ({...state, syncLoading: true, syncLoaded: false})),
  on(schoolsActions.updateCleverInfo, (state, {cleverInfo}) => {
    return { ...state, syncLoaded: true, syncLoading: false, cleverInfo };
  }),
  on(schoolsActions.updateGSuiteInfo, (state, {gsuiteInfo}) => {
    return { ...state, gSuiteInfo: gsuiteInfo, syncLoaded: true, syncLoading: false };
  }),
  on(schoolsActions.clearSchools, (state) => (schoolsInitialState))
);

export function schoolsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
