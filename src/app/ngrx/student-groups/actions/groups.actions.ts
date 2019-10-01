import {createAction, props} from '@ngrx/store';
import {StudentList} from '../../../models/StudentList';

const COMPONENT = 'Student Group';

export const getStudentGroups = createAction(`[${COMPONENT}] Get Student Groups`);
export const getStudentGroupsSuccess = createAction(`[${COMPONENT}] Get Student Groups Success`, props<{groups: StudentList[]}>());
export const getStudentsGroupsFailure = createAction(`[${COMPONENT}] Get Student Groups Failure`, props<{errorMessage: string}>());

export const postStudentGroup = createAction(`[${COMPONENT}] Post Student Group`, props<{group: any}>());
export const postStudentGroupSuccess = createAction(`[${COMPONENT}] Post Student Group Success`, props<{group: StudentList}>());
export const postStudentGroupFailure = createAction(`[${COMPONENT}] Post Student Group Failure`, props<{errorMessage: string}>());

export const updateStudentGroup = createAction(`[${COMPONENT}] Update Student Group`, props<{id: string | number, group: any}>());
export const updateStudentGroupSuccess = createAction(`[${COMPONENT}] Update Student Group Success`, props<{group: StudentList}>());
export const updateStudentGroupFailure = createAction(`[${COMPONENT}] Update Student Group Failure`, props<{errorMessage: string}>());

export const removeStudentGroup = createAction(`[${COMPONENT}] Remove Student Group`, props<{id: string | number}>());
export const removeStudentGroupSuccess = createAction(`[${COMPONENT}] Remove Student Group Success`, props<{id: string | number}>());
export const removeStudentsGroupFailure = createAction(`[${COMPONENT}] Remove Student Group Success`, props<{errorMessage: string}>());
