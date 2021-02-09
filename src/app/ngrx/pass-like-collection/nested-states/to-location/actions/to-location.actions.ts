import {createAction, props} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Location} from '../../../../../models/Location';
import {HallPass} from '../../../../../models/HallPass';

const TOLOCATION = 'To Location Passes';

export const getToLocationPasses = createAction(`[${TOLOCATION}] Get To Location Passes`, props<{ sortingEvents: Observable<{ sort: string; search_query: string }>, filter: Location[], date: Date }>());
export const getToLocationPassesSuccess = createAction(`[${TOLOCATION}] Get To Location Passes Success`, props<{toLocationPasses: HallPass[]}>());
export const getToLocationPassesFailure = createAction(`[${TOLOCATION}] Get To Location Passes Failure`, props<{errorMessage: string}>());
