import {ProcessState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as processActions from '../actions';

const onboardProcessInitialState: ProcessState = {
  entities: null,
  ids: [],
  loading: false,
  loaded: false
};

const reducer = createReducer(
  onboardProcessInitialState,
  on(processActions.getOnboardProcess,
    processActions.updateOnboardProcess, state => ({...state, loading: true, loaded: false})),
  on(processActions.getOnboardProcessSuccess,
    (state, {process}) => {

    const ids = process.map(p => p.name);
    const entities = process.reduce((acc, curr) => {
      return {...acc, [curr.name]: curr};
    }, {});

    return { ...state, entities, ids, loading: false, loaded: true };
  }),
  on(processActions.updateOnboardProcessSuccess, (state, {process}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      entities: { ...state.entities, [process.name]: process }
    };
  })
);

export function onboardProcessReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
