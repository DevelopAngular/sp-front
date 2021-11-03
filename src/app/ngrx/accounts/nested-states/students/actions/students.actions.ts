import {createAction, props} from '@ngrx/store';
import {PostRoleProps, RoleProps} from '../../../states';
import {User} from '../../../../../models/User';

const STUDENTS = 'Students Accounts';

export const getStudents = createAction(`[${STUDENTS}] Get Students`, props<RoleProps>());
export const getStudentsSuccess = createAction(`[${STUDENTS}] Get Students Success`, props<{students: User[], next: string}>());
export const getStudentsFailure = createAction(`[${STUDENTS}] Get Students Failure`, props<{errorMessage: string}>());

export const getMoreStudents = createAction(`[${STUDENTS}] Get More Students`, props<{role: string}>());
export const getMoreStudentsSuccess = createAction(`[${STUDENTS}] Get More Students Success`, props<{moreStudents: User[], next: string}>());
export const getMoreStudentsFailure = createAction(`[${STUDENTS}] Get More Students Failure`, props<{errorMessage: string}>());

export const postStudent = createAction(`[${STUDENTS}] Post Student`, props<PostRoleProps>());
export const postStudentSuccess = createAction(`[${STUDENTS}] Post Students Success`, props<{student: User}>());

export const removeStudent = createAction(`[${STUDENTS}] Remove Student`, props<{id: string | number}>());
export const removeStudentSuccess = createAction(`[${STUDENTS}] Remove Student Success`, props<{id: string | number}>());
export const removeStudentFailure = createAction(`[${STUDENTS}] Remove Student Failure`, props<{errorMessage: string}>());

export const updateStudentActivity = createAction(`[${STUDENTS}] Update Student Activity`, props<{profile: User, active: boolean}>());
export const updateStudentActivitySuccess = createAction(`[${STUDENTS}] Update Student Activity Success`, props<{profile: User}>());
export const updateStudentActivityFailure = createAction(`[${STUDENTS}] Update Student Activity Failure`, props<{errorMessage: string}>());

export const updateStudentAccount = createAction(`[${STUDENTS}] Update Student Account`, props<{profile: User}>());

export const addUserToStudentProfile = createAction(`[${STUDENTS}] Add User To Student Profile`, props<{user: User, role: string}>());
export const addUserToStudentProfileSuccess = createAction(`[${STUDENTS}] Add User To Student Profile Success`, props<{student: User}>());
export const addUserToStudentProfileFailure = createAction(`[${STUDENTS}] Add User To Student Profile Failure`, props<{errorMessage: string}>());

export const bulkAddStudentAccounts = createAction(`[${STUDENTS}] Bulk Add Students Accounts`, props<{students: User[]}>());

export const sortStudentAccounts = createAction(`[${STUDENTS}] Sort Student Accounts`, props<{students: User[], next: string, sortValue: string}>());

export const clearCurrentUpdatedStudent = createAction(`[${STUDENTS}] Clear Current Updated Student`);
