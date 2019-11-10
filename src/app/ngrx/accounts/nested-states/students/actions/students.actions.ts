import {createAction, props} from '@ngrx/store';
import {RoleProps} from '../../../states';
import {User} from '../../../../../models/User';

const STUDENTS = 'Students Accounts';

export const getStudents = createAction(`[${STUDENTS}] Get Students`, props<RoleProps>());
export const getStudentsSuccess = createAction(`[${STUDENTS}] Get Students Success`, props<{students: User[]}>());
export const getStudentsFailure = createAction(`[${STUDENTS}] Get Students Failure`, props<{errorMessage: string}>());

export const removeStudent = createAction(`[${STUDENTS}] Remove Student`, props<{id: string | number}>());
export const removeStudentSuccess = createAction(`[${STUDENTS}] Remove Student Success`, props<{id: string | number}>());
export const removeStudentFailure = createAction(`[${STUDENTS}] Remove Student Failure`, props<{errorMessage: string}>());

export const updateStudentActivity = createAction(`[${STUDENTS}] Update Student Activity`, props<{profile: User, active: boolean}>());
export const updateStudentActivitySuccess = createAction(`[${STUDENTS}] Update Student Activity Success`, props<{profile: User}>());
export const updateStudentActivityFailure = createAction(`[${STUDENTS}] Update Student Activity Failure`, props<{errorMessage: string}>());
