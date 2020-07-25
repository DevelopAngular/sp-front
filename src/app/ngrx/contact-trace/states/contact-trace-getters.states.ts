import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IContactTraceStates} from './contact-trace.states';

export const getContactTraceState = (state: AppState) => state.contactTrace;

export const getContactTraceCollection = createSelector(
  getContactTraceState,
  (state: IContactTraceStates) => state.data
);

export const getContactTraceLoaded = createSelector(
  getContactTraceState,
  (state: IContactTraceStates) => state.loaded
);

export const getContactTraceLoading = createSelector(
  getContactTraceState,
  (state: IContactTraceStates) => state.loading
);
