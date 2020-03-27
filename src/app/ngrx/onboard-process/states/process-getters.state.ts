import {ProcessState} from './process.state';
import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';

export const getProcessState = (state: AppState) => state.onboardProcess;

export const getProcessEntities = createSelector(
  getProcessState,
  (state: ProcessState) => state.entities
);

export const getProcessIds = createSelector(
  getProcessState,
  (state: ProcessState) => state.ids
);

export const getProcessData = createSelector(
  getProcessEntities,
  getProcessIds,
  (entities, ids) => {
    return ids.map(id => entities[id]);
  }
);

export const getLoadedProcess = createSelector(
  getProcessState,
  (state: ProcessState) => state.loaded
);

export const getLoadingProcess = createSelector(
  getProcessState,
  (state: ProcessState) => state.loading
);
