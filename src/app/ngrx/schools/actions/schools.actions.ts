import { createAction, props } from '@ngrx/store';
import { School } from '../../../models/School';

const COMPONENT = 'Schools';

export const getSchools = createAction(`[${COMPONENT}] Get Schools`);
export const getSchoolsSuccess = createAction(`[${COMPONENT}] Get Schools Success`, props<{schools: School[]}>());
export const getSchoolsFailure = createAction(`[${COMPONENT}] Get Schools Failure`, props<{errorMessage: string}>());

export const updateSchool = createAction(`[${COMPONENT}] Update School`, props<{school: School, fields: any}>());
export const updateSchoolSuccess = createAction(`[${COMPONENT}] Update School Success`, props<{school: School}>());
export const updateSchoolFailure = createAction(`[${COMPONENT}] Update School Failure`, props<{errorMessage: string}>());
