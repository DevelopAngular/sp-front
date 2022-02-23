import {createAction, props} from '@ngrx/store';


const SPS = 'Smartpass Search';

export const searchAction = createAction(`[${SPS}] Search`, props<{searchValue: string}>());
export const searchActionSuccess = createAction(`[${SPS}] Search Success`, props<{searchResult: any[]}>());
export const searchActionFailure = createAction(`[${SPS}] Search Failure`, props<{errorMessage: string}>());

export const clearSearchResult = createAction(`[${SPS}] Clear Search Result`);

export const postRecentSearch = createAction(`[${SPS}] Post Recent Search`, props<{userId: number | string}>());
export const postRecentSearchSuccess = createAction(`[${SPS}] Post Recent Search Success`, props<{search: any}>());
export const postRecentSearchFailure = createAction(`[${SPS}] Post Recent Search Failure`, props<{errorMessage: string}>());

