import {ISmartpassSearchState} from '../states/smartpass-search.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as searchActions from '../actions';

const searchInitialState: ISmartpassSearchState = {
  searchResult: [],
  recentSearch: [],
  loading: false,
  loaded: false
};

const reducer = createReducer(
  searchInitialState,
  on(searchActions.searchAction, state => ({...state, loading: true, loaded: false})),
  on(searchActions.searchActionSuccess, (state, {searchResult}) => {
    return {...state, loading: false, loaded: true, searchResult};
  }),
  on(searchActions.clearSearchResult, state => ({...state, loading: false, loaded: false, searchResult: []})),
  on(searchActions.postRecentSearchSuccess, (state, {search}) => {
    return { ...state, recentSearch: [search, ...state.recentSearch] };
  })
);

export function smartpassSearchReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
