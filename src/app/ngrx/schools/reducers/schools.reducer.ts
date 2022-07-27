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
  gg4lInfo: null,
  syncInfo: null,
  gSuiteInfo: null,
  cleverInfo: null,
  syncLoading: false,
  syncLoaded: false,
  encounterDetection: null
};

const reducer = createReducer(
  schoolsInitialState,
  on(schoolsActions.getSchools,
      schoolsActions.updateSchool,
      state => ({...state, loading: true, loaded: false, currentSchoolId: null})),
  on(schoolsActions.getSchoolsSuccess, (state, {schools}) => {
    return schoolAdapter.addAll(schools, {...state, loading: false, loaded: true});
  }),
  on(schoolsActions.getEncounterDetection,
    state => ({...state, loading: true, loaded: false})),
    on(schoolsActions.getEncounterDetectionSuccess, (state, {encounterDetection}) => {
      return {...state, loading: false, loaded: true, encounterDetection};
    }),
  on(schoolsActions.getSchoolsGG4LInfoSuccess, (state, {gg4lInfo}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      gg4lInfo
    };
  }),
  on(schoolsActions.updateSchoolsGG4LInfoSuccess, (state, {gg4lInfo}) => {
    return {...state};
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
  on(
    schoolsActions.syncClever,
    schoolsActions.syncGsuite,
    (state) => ({...state, syncLoading: true, syncLoaded: false})),
  on(schoolsActions.updateCleverInfo, (state, {cleverInfo}) => {
    return { ...state, syncLoaded: true, syncLoading: false, cleverInfo };
  }),
  // on(schoolsActions.syncGsuiteSuccess, (state, {data}) => {
  //   return { ...state, syncLoaded: true, syncLoading: false };
  // }),
  on(schoolsActions.updateGSuiteInfo, (state, {gsuiteInfo}) => {
    return { ...state, gSuiteInfo: gsuiteInfo, syncLoaded: true, syncLoading: false };
  }),
  on(schoolsActions.clearSchools, (state) => (schoolsInitialState))
);

export function schoolsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
