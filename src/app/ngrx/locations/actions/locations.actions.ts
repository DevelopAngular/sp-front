import {createAction, props} from '@ngrx/store';
import {User} from '../../../models/User';
import {Location} from '../../../models/Location';

const LOCATIONS = 'Locations';

export const getLocsWithTeachers = createAction(`[${LOCATIONS}] Get Locs With Teachers`, props<{teachers: User[]}>());
export const getLocsWithTeachersSuccess = createAction(`[${LOCATIONS}] Get Locs With Teachers Success`, props<{locs: Location[]}>());
export const getLocsWithTeachersFailure = createAction(`[${LOCATIONS}] Get Locs With Teachers Failure`, props<{errorMessage: string}>());

export const addLocationsToUser = createAction(`[${LOCATIONS}] Add Locs To User`, props<{users: User[]}>());