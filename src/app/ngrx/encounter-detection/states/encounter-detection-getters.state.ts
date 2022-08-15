import { createSelector } from '@ngrx/store';
import { AppState } from '../../app-state/app-state';
import { EncounterDetectionState } from './encounter-detection.state';

export const getEncounterdetectionState = (state: AppState) => state.encounterDetection;

export const getEncounterDetectionLoading = createSelector(
    getEncounterdetectionState,
    (state: EncounterDetectionState) => state.loading
);

export const getEncounterDetectionErrored = createSelector(
  getEncounterdetectionState,
  (state: EncounterDetectionState) =>  state.error
);

export const getEncounterDetectionCollection = createSelector(
    getEncounterdetectionState,
    (state: EncounterDetectionState) => state.encounterDetection
);
