import {createAction, props} from '@ngrx/store';


const SPS = 'Smartpass Search';

export const searchAction = createAction(`[${SPS}] Search`, props<{searchValue: string}>());
export const searchActionSuccess = createAction(`[${SPS}] Search Success`, props<{searchResult: any[]}>());
export const searchActionFailure = createAction(`[${SPS}] Search Failure`, props<{errorMessage: string}>());

export const clearSearchResult = createAction(`[${SPS}] Clear Search Result`);
