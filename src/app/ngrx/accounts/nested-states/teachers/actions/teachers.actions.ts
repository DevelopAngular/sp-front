import {createAction, props} from '@ngrx/store';
import {RoleProps} from '../../../states';
import {User} from '../../../../../models/User';

const TEACHER = 'Teacher Account';

export const getTeachers = createAction(`[${TEACHER}] Get Teachers`, props<RoleProps>());
export const getTeachersSuccess = createAction(`[${TEACHER}] Get Teachers Success`, props<{teachers: User[]}>());
export const getTeachersFailure = createAction(`[${TEACHER}] Get Teachers Failure`, props<{errorMessage: string}>());

export const removeTeacher = createAction(`[${TEACHER}] Remove Teacher`, props<{id: string | number}>());
export const removeTeacherSuccess = createAction(`[${TEACHER}] Remove Teacher Success`, props<{id: number | string}>());
export const removeTeacherFailure = createAction(`[${TEACHER}] Remove Teacher Failure`, props<{errorMessage: string}>());