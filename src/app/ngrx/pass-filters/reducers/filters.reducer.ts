import {Action, createReducer, on} from '@ngrx/store';
import {IFiltersState} from '../states';
import * as filterActions from '../actions';

export const passFiltersInitialState: IFiltersState = {
  loading: false,
  loaded: false,
  filters: null
};

const reducer = createReducer(
  passFiltersInitialState,
  on(filterActions.getPassFilter,
    filterActions.updatePassFilter,
      state => ({...state, loading: true, loaded: false})),
  on(filterActions.getPassFilterSuccess,
    filterActions.updatePassFilterSuccess,
    (state, {model, filterData}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      filters: {
        ...state.filters,
        [model]: filterData
      }
    };
  })
);

export function PassFiltersReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
