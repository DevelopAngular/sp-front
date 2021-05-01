import {createAction, props} from '@ngrx/store';
import {Observable} from 'rxjs';
import {Location} from '../../../../../models/Location';
import {HallPass} from '../../../../../models/HallPass';

const FROMLOCATION = 'From Location Passes';

export const getFromLocationPasses = createAction(`[${FROMLOCATION}] Get From Location Passes`, props<{ sortingEvents: Observable<{ sort: string; search_query: string }>, filter: Location[], date: Date }>());
export const getFromLocationPassesSuccess = createAction(`[${FROMLOCATION}] Get From Location Passes Success`, props<{fromLocationPasses: HallPass[]}>());
export const getFromLocationPassesFailure = createAction(`[${FROMLOCATION}] Get From Location Passes Failure`, props<{errorMessage: string}>());

