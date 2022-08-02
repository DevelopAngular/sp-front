import { createSelector } from "@ngrx/store";
import { AppState } from "../../app-state/app-state";
import { adapter } from "../reducers";
import { EncounterDetectionState } from "./encounter-detection.state";

export const getEncounterdetectionState = (state: AppState) => state.encounterDetection;

export const getEncounterDetectionCollection = adapter.getSelectors(getEncounterdetectionState).selectAll;
// export const getEncounterDetectionEntities = adapter.getSelectors(getEncounterdetectionState).selectEntities;

export const getEncounterDetectionLoading = createSelector(
    getEncounterdetectionState,
    (state: EncounterDetectionState) => state.loading
);

export const getEncounterDetectionLoaded = createSelector(
    getEncounterdetectionState,
    (state: EncounterDetectionState) => state.loaded
);

export const getEncounterDetectionState = createSelector(
    getEncounterdetectionState,
    (state: EncounterDetectionState) => state.encounterDetection
);