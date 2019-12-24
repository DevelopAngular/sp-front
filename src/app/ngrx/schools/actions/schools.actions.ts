import { createAction, props } from '@ngrx/store';
import { School } from '../../../models/School';
import {GG4LSync} from '../../../models/GG4LSync';

const COMPONENT = 'Schools';

export const getSchools = createAction(`[${COMPONENT}] Get Schools`);
export const getSchoolsSuccess = createAction(`[${COMPONENT}] Get Schools Success`, props<{schools: School[]}>());
export const getSchoolsFailure = createAction(`[${COMPONENT}] Get Schools Failure`, props<{errorMessage: string}>());

export const getSchoolsGG4LInfo = createAction(`[${COMPONENT}] Get GG4L Info`);
export const getSchoolsGG4LInfoSuccess = createAction(`[${COMPONENT}] Get GG4L Info Success`, props<{gg4lInfo: GG4LSync}>());
export const getSchoolsGG4LInfoFailure = createAction(`[${COMPONENT}] Get GG4L Info Failure`, props<{errorMessage: string}>());
