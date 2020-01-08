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
  on(processActions.getOnboardProcessSuccess,
    processActions.updateOnboardProcessSuccess,
    (state, {process}) => {
    return {
      ...state,
      data: process,
      loading: false,
      loaded: true
    };
  }),
);

export function onboardProcessReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
