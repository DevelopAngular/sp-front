import {createAction, props} from '@ngrx/store';
import {Observable} from 'rxjs';
import {HallPassFilter, PassFilterType} from '../../../../../live-data/live-data.service';
import {HallPass} from '../../../../../models/HallPass';

const HALLMONITOR = 'Hall Monitor';

export const getHallMonitorPasses = createAction(`[${HALLMONITOR}] Get Hall Monitor Passes`, props<{sortingEvents: Observable<HallPassFilter>, filter: PassFilterType, date: Date}>());
export const getHallMonitorPassesSuccess = createAction(`[${HALLMONITOR}] Get Hall Monitor Passes Sucess`, props<{hallMonitorPasses: HallPass[]}>());
export const getHallMonitorPassesFailure = createAction(`[${HALLMONITOR}] Get Hall Monitor Passes Failure`, props<{errorMessage: string}>());

export const updateHallMonitorPasses = createAction(`[${HALLMONITOR}] Update Hall Monitor Passes`, props<{sortingEvents: Observable<HallPassFilter>, filter: PassFilterType, date: Date}>());
export const updateHallMonitorPassesSuccess = createAction(`[${HALLMONITOR}] Update Hall Monitor Passes Sucess`, props<{hallMonitorPasses: HallPass[]}>());
export const updateHallMonitorPassesFailure = createAction(`[${HALLMONITOR}] Update Hall Monitor Passes Failure`, props<{errorMessage: string}>());

