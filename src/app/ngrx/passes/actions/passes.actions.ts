import {createAction, props} from '@ngrx/store';
import {HallPass} from '../../../models/HallPass';
import {User} from '../../../models/User';

const PASSES = 'Passes';

export const searchPasses = createAction(`[${PASSES}] Search Passes`, props<{url: string}>());
export const searchPassesSuccess = createAction(`[${PASSES}] Search Passes Success`, props<{ passes: HallPass[], next: string, totalCount: number }>());
export const searchPassesFailure = createAction(`[${PASSES}] Search Passes Failure`, props<{errorMessage: string}>());

export const getMorePasses = createAction(`[${PASSES}] Get More Passes`);
export const getMorePassesSuccess = createAction(`[${PASSES}] Get More Passes Success`, props<{passes: HallPass[], next: string}>());
export const getMorePassesFailure = createAction(`[${PASSES}] Get More Passes Failure`, props<{errorMessage: string}>());

export const sortPasses = createAction(`[${PASSES}] Sort Passes`, props<{queryParams: any}>());
export const sortPassesSuccess = createAction(`[${PASSES}] Sort Passes Success`, props<{next: string, passes: HallPass[], sortValue: string}>());
export const sortPassesFailure = createAction(`[${PASSES}] Sort Passes Failure`, props<{errorMessage: string}>());

export const endPassAction = createAction(`[${PASSES}] End Pass`, props<{passId: string | number}>());
export const endPassActionSuccess = createAction(`[${PASSES}] End Pass Success`, props<{user: User, timeFilter: string}>());
export const endPassActionFailure = createAction(`[${PASSES}] End Pass Failure`, props<{errorMessage: string}>());

export const changePassesCollectionAction = createAction(`[${PASSES}]  Change Passes's Collection`, props<{passIds: number[]}>());
