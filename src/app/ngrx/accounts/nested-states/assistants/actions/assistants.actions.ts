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

export const addRepresentedUserAction =
  createAction(`[${ASSISTANTS}] Add Represented AU`, props<{profile: any, user: any}>());
export const addRepresentedUserSuccess =
  createAction(`[${ASSISTANTS}] Add Represented AU Success`, props<{profile: User}>());
export const addRepresentedUserFailure =
  createAction(`[${ASSISTANTS}] Add Represented AU Failure`, props<{errorMessage: string}>());

export const removeRepresentedUserAction =
  createAction(`[${ASSISTANTS}] Remove Represented AU`, props<{profile: any, user: any}>());
export const removeRepresentedUserSuccess =
  createAction(`[${ASSISTANTS}] Remove Represented AU Success`, props<{profile: User}>());
export const removeRepresentedUserFailure =
  createAction(`[${ASSISTANTS}] Remove Represented AU Failure`, props<{errorMessage: string}>());



