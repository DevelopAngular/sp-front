import {createAction, props} from '@ngrx/store';
import {PostRoleProps, RoleProps} from '../../../states';
import {User} from '../../../../../models/User';
import {UserStats} from '../../../../../models/UserStats';
import {Report} from '../../../../../models/Report';

const PARENTS = 'Parents Accounts';

export const getParents = createAction(`[${PARENTS}] Get Parents`, props<RoleProps>());
export const getParentsSuccess = createAction(`[${PARENTS}] Get Parents Success`, props<{parents: User[], next: string}>());
export const getParentsFailure = createAction(`[${PARENTS}] Get Parents Failure`, props<{errorMessage: string}>());

export const getMoreParents = createAction(`[${PARENTS}] Get More Parents`, props<{role: string}>());
export const getMoreParentSuccess = createAction(`[${PARENTS}] Get More Parents Success`, props<{moreParents: User[], next: string}>());
export const getMoreParentsFailure = createAction(`[${PARENTS}] Get More Parents Failure`, props<{errorMessage: string}>());

export const postParent = createAction(`[${PARENTS}] Post Parent`, props<PostRoleProps>());
export const postParentSuccess = createAction(`[${PARENTS}] Post Parents Success`, props<{parent: User}>());

export const removeParent = createAction(`[${PARENTS}] Remove Parent`, props<{id: string | number}>());
export const removeParentSuccess = createAction(`[${PARENTS}] Remove Parent Success`, props<{id: string | number}>());
export const removeParentFailure = createAction(`[${PARENTS}] Remove Parent Failure`, props<{errorMessage: string}>());

export const updateParentActivity = createAction(`[${PARENTS}] Update Parent Activity`, props<{profile: User, active: boolean}>());
export const updateParentActivitySuccess = createAction(`[${PARENTS}] Update Parent Activity Success`, props<{profile: User}>());
export const updateParentActivityFailure = createAction(`[${PARENTS}] Update Parent Activity Failure`, props<{errorMessage: string}>());

export const updateParentAccount = createAction(`[${PARENTS}] Update Parent Account`, props<{profile: User}>());

export const addUserToParentProfile = createAction(`[${PARENTS}] Add User To Parent Profile`, props<{user: User, role: string}>());
export const addUserToParentProfileSuccess = createAction(`[${PARENTS}] Add User To Parent Profile Success`, props<{parent: User}>());
export const addUserToParentProfileFailure = createAction(`[${PARENTS}] Add User To Parent Profile Failure`, props<{errorMessage: string}>());

export const bulkAddParentAccounts = createAction(`[${PARENTS}] Bulk Add Parents Accounts`, props<{parents: User[]}>());

export const sortParentAccounts = createAction(`[${PARENTS}] Sort Parent Accounts`, props<{parents: User[], next: string, sortValue: string}>());

export const clearCurrentUpdatedParent = createAction(`[${PARENTS}] Clear Current Updated Parent`);

export const getParentStats = createAction(`[User] Get Parent Stats`, props<{userId: string | number, queryParams?: any}>());
export const getParentStatsSuccess = createAction(`[User] Get Parent Stats Success`, props<{userId: string | number, stats: UserStats}>());
export const getParentStatsFailure = createAction(`[User] Get Parent Stats Failure`, props<{errorMessage: string}>());

// export const addReportToStats = createAction(`[User] Add Report`, props<{report: Report}>());
// export const addReportToStatsSuccess = createAction(`[User] Add Report Success`, props<{report: Report}>());
// export const addReportToStatsFailure = createAction(`[User] Add Report Failure`, props<{errorMessage: string}>());
