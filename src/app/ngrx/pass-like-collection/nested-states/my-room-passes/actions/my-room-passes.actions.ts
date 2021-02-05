import {createAction, props} from '@ngrx/store';
import {HallPass} from '../../../../../models/HallPass';
import {Observable} from 'rxjs';
import {HallPassFilter, PassFilterType} from '../../../../../live-data/live-data.service';

const MYROOM = 'My Room';

export const getMyRoomPasses = createAction(`[${MYROOM}] Get My Room Passes`, props<{sortingEvents: Observable<HallPassFilter>, filter: PassFilterType, date: Date}>());
export const getMyRoomPassesSuccess = createAction(`[${MYROOM}] Get My Room Passes Success`, props<{myRoomPasses: HallPass[]}>());
export const getMyRoomPassesFailure = createAction(`[${MYROOM}] Get My Room Passes Failure`, props<{errorMessage: string}>());
