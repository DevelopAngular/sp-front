import {createAction, props} from '@ngrx/store';
import {RoleProps} from '../../../states';
import {User} from '../../../../../models/User';

const ASSISTANTS = 'Assistant Account';

export const getAssistants = createAction(`[${ASSISTANTS}] Get Assistants`, props<RoleProps>());
export const getAssistantsSuccess = createAction(`[${ASSISTANTS}] Get Assistants Success`, props<{assistants: User[]}>());
export const getAssistantsFailure = createAction(`[${ASSISTANTS}] Get Assistants Failure`, props<{errorMessage: string}>());

export const removeAssistant = createAction(`[${ASSISTANTS}] Remove Assistant`, props<{id: string | number}>());
export const removeAssistantSuccess = createAction(`[${ASSISTANTS}] Remove Assistant Success`, props<{id: string | number}>());
export const removeAssistantFailure = createAction(`[${ASSISTANTS}] Remove Assistant Failure`, props<{errorMessage: string}>());

export const updateAssistantActivity = createAction(`[${ASSISTANTS}] Update Assistant Activity`, props<{profile: User, active: boolean}>());
export const updateAssistantActivitySuccess = createAction(`[${ASSISTANTS}] Update Assistant Activity Success`, props<{profile: User}>());
export const updateAssistantActivityFailure =
  createAction(`[${ASSISTANTS}] Update Assistant Activity Failure`, props<{errorMessage: string}>());


