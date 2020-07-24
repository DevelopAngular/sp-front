import { createAction, props } from '@ngrx/store';
import { ContactTrace } from '../../../models/ContactTrace';

const CONTACTTRACE = 'Contact Trace';

export const getContacts = createAction(`[${CONTACTTRACE}] Get Contact Trace`, props<{studentsIds: number[] | string[], start_time: string}>());
export const getContactsSuccess = createAction(`[${CONTACTTRACE}] Get Contact Trace Success`, props<{contacts_trace: ContactTrace[]}>());
export const getContactsFailure = createAction(`[${CONTACTTRACE}] Get Contact Trace Failure`, props<{errorMessage: string}>());

