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

export const updateTeacherActivity = createAction(`[${TEACHER}] Update Teacher Activity`, props<{profile: User, active: boolean}>());
export const updateTeacherActivitySuccess = createAction(`[${TEACHER}] Update Teacher Activity Success`, props<{profile: User}>());
export const updateTeacherActivityFailure = createAction(`[${TEACHER}] Update Teacher Activity Failure`, props<{errorMessage: string}>());

export const updateTeacherPermissions = createAction(`[${TEACHER}] Update Teacher Permissions`, props<{profile: User, permissions: any}>());
export const updateTeacherPermissionsSuccess = createAction(`[${TEACHER}] Update Teacher Permissions Success`, props<{profile: User}>());
export const updateTeacherPermissionsFailure = createAction(`[${TEACHER}] Update Teacher Permissions Failure`, props<{errorMessage: string}>());

