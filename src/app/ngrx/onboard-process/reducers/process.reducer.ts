import { ProcessState } from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as processActions from '../actions';

const onboardProcessInitialState: ProcessState = {
  data: [],
  loading: false,
  loaded: false
};

const reducer = createReducer(
  onboardProcessInitialState,
  on(processActions.getOnboardProcess, state => ({...state, loading: true, loaded: false})),
  on(processActions.getOnboardProcessSuccess, (state, {process}) => {
    return {
      ...state,
      data: process,
      loading: false,
      loaded: true
    };
  }),
  on(processActions.updateOnboardProcessSuccess, (state, {process}) => {
    state.data.forEach(proc => {
      if (proc.name === process) {
        proc.done = new Date().toISOString();
      }
    });
    return {...state};
  })
);

export function onboardProcessReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
