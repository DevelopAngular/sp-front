import {createAction, props} from '@ngrx/store';
import {ColorProfile} from '../../../models/ColorProfile';

const COMPONENT = 'Color Profile';

export const getColorProfiles = createAction(`[${COMPONENT}] Get Color Profiles`);
export const getColorProfilesSuccess = createAction(`[${COMPONENT}] Get Color profile Success`, props<{colors: ColorProfile[]}>());
export const getColorProfilesFailure = createAction(`[${COMPONENT}] Get Color Profiles Failure`, props<{errorMessage: string}>());
