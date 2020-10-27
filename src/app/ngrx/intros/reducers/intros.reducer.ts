import {Action, createReducer, on} from '@ngrx/store';
import {IIntrosState} from '../state';
import * as introsActions from '../actions';

export const introsInitialState: IIntrosState = {
  data: null,
  loading: false,
  loaded: false
};

const reducer = createReducer(
  introsInitialState,
  on(introsActions.getIntros, introsActions.updateIntros,
    (state) => ({...state, loading: true, loaded: false})),
  on(introsActions.getIntrosSuccess, introsActions.updateIntrosSuccess, (state, {data}) => {
    return {...state, loading: false, loaded: true, data };
  }),
);

export function IntrosReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
