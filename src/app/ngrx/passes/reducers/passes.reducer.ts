import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../models/HallPass';
import {IPassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';

import * as passesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const passesInitialState: IPassesState = adapter.getInitialState({
  loading: false,
  loaded: false,
  moreLoading: false,
  nextRequest: null,
  lastAddedPasses: [],
  sortLoading: false,
  sortLoaded: false,
  sortValue: '',
  totalCount: null,
  startPassLoading: false
});

const reducer = createReducer(
  passesInitialState,
  on(
    passesActions.searchPasses,
    // passesActions.getMorePasses,
      state => ({...state, loading: true, loaded: false})),
  on(passesActions.searchPassesSuccess, (state, {passes, next, totalCount}) => {
    return adapter.addAll(passes, {...state, loading: false, loaded: true, nextRequest: next, lastAddedPasses: passes, totalCount, sortValue: 'desc'});
  }),
  on(passesActions.getMorePassesSuccess, (state, {passes, next}) => {
    return adapter.addMany(passes, {...state, loaded: true, loading: false, nextRequest: next, lastAddedPasses: passes, moreLoading: false});
  }),
  on(passesActions.sortPasses, (state) => ({...state, sortLoading: true, sortLoaded: false})),
  on(passesActions.sortPassesSuccess, (state, {next, passes, sortValue}) => {
    return adapter.addAll(passes, {...state, nextRequest: next, sortLoading: false, sortLoaded: true, sortValue});
  }),
  on(passesActions.getMorePassesFailure, (state, {errorMessage}) => ({...state, loaded: true, loading: false})),
  on(passesActions.endPassAction, (state) => ({ ...state, startPassLoading: true })),
  on(passesActions.endPassActionSuccess, passesActions.endPassActionFailure, (state) => ({ ...state, startPassLoading: false})),
);


export function passesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
