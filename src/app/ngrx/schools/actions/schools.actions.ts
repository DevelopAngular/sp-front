import { createAction, props } from '@ngrx/store';
import { School } from '../../../models/School';

const COMPONENT = 'Schools';

export const getSchools = createAction(`[${COMPONENT}] Get Schools`);
export const getSchoolsSuccess = createAction(`[${COMPONENT}] Get Schools Success`, props<{schools: School[]}>());
export const getSchoolsFailure = createAction(`[${COMPONENT}] Get Schools Failure`, props<{errorMessage: string}>());
