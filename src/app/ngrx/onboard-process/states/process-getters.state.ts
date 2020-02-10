import {ProcessState} from './process.state';
import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';

export const getProcessState = (state: AppState) => state.onboardProcess;

export const getProcessData = createSelector(
  getProcessState,
  (state: ProcessState) => state.data
);

export const getLoadedProcess = createSelector(
  getProcessState,
  (state: ProcessState) => state.loaded
);

export const getLoadingProcess = createSelector(
  getProcessState,
  (state: ProcessState) => state.loading
);
