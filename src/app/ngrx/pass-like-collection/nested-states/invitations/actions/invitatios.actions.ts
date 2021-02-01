import {createAction, props} from '@ngrx/store';
import {User} from '../../../../../models/User';
import {Invitation} from '../../../../../models/Invitation';

const INVITATIONS = 'Invitations';

export const getInvitations = createAction(`[${INVITATIONS}] Get Invitations`, props<{user: User}>());
export const getInvitationsSuccess = createAction(`[${INVITATIONS}] Get Invitations Success`, props<{invitations: Invitation[]}>());
export const getInvitationsFailure = createAction(`[${INVITATIONS}] Get Invitations Failure`, props<{errorMessage: string}>());
