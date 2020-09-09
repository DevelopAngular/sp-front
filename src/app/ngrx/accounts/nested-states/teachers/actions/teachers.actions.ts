import {createAction, props} from '@ngrx/store';
import {PostRoleProps, RoleProps} from '../../../states';
import {User} from '../../../../../models/User';

const TEACHER = 'Teacher Account';

export const getTeachers = createAction(`[${TEACHER}] Get Teachers`, props<RoleProps>());
export const getTeachersSuccess = createAction(`[${TEACHER}] Get Teachers Success`, props<{teachers: User[], next: string}>());
export const getTeachersFailure = createAction(`[${TEACHER}] Get Teachers Failure`, props<{errorMessage: string}>());

export const getMoreTeachers = createAction(`[${TEACHER}] Get More Teachers`);
export const getMoreTeachersSuccess = createAction(`[${TEACHER}] Get More Teachers Success`, props<{moreTeachers: User[], next: string}>());
export const getMoreTeachersFailure = createAction(`[${TEACHER}] Get More Teachers Failure`, props<{errorMessage: string}>());

export const postTeacher = createAction(`[${TEACHER}] Post Teacher`, props<PostRoleProps>());
export const postTeacherSuccess = createAction(`[${TEACHER}] Post Teacher Success`, props<{teacher: User}>());

export const removeTeacher = createAction(`[${TEACHER}] Remove Teacher`, props<{id: string | number}>());
export const removeTeacherSuccess = createAction(`[${TEACHER}] Remove Teacher Success`, props<{id: number | string}>());
export const removeTeacherFailure = createAction(`[${TEACHER}] Remove Teacher Failure`, props<{errorMessage: string}>());

export const updateTeacherActivity = createAction(`[${TEACHER}] Update Teacher Activity`, props<{profile: User, active: boolean}>());
export const updateTeacherActivitySuccess = createAction(`[${TEACHER}] Update Teacher Activity Success`, props<{profile: User}>());
export const updateTeacherActivityFailure = createAction(`[${TEACHER}] Update Teacher Activity Failure`, props<{errorMessage: string}>());

export const updateTeacherPermissions = createAction(`[${TEACHER}] Update Teacher Permissions`, props<{profile: User, permissions: any}>());
export const updateTeacherPermissionsSuccess = createAction(`[${TEACHER}] Update Teacher Permissions Success`, props<{profile: User}>());
export const updateTeacherPermissionsFailure = createAction(`[${TEACHER}] Update Teacher Permissions Failure`, props<{errorMessage: string}>());

export const updateTeacherAccount = createAction(`[${TEACHER}] Update Teacher Account`, props<{profile: User}>());

export const addUserToTeacherProfile = createAction(`[${TEACHER}] Add User To Teacher Profile`, props<{user: User, role: string}>());
export const addUserToTeacherProfileSuccess = createAction(`[${TEACHER}] Add User To Teacher Profile Success`, props<{teacher: User}>());
export const addUserToTeacherProfileFailure = createAction(`[${TEACHER}] Add User To Teacher Profile`, props<{errorMessage: string}>());


