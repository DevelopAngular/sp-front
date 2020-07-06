import { createAction, props } from '@ngrx/store';
import { HallPass } from '../../../models/HallPass';

const PASSES = 'Passes';

export const searchPasses = createAction(`[${PASSES}] Search Passes`, props<{url: string}>());
export const searchPassesSuccess = createAction(`[${PASSES}] Search Passes Success`, props<{ passes: HallPass[] }>());
export const searchPassesFailure = createAction(`[${PASSES}] Search Passes Failure`, props<{errorMessage: string}>());
