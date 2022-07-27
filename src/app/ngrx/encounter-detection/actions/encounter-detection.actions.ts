import { createAction, props } from "@ngrx/store";
import { EncounterDetection } from "../../../models/EncounterDetection";

const ENCOUNTERDETECTION = 'Encounter Detection';

export const getEncounterDetection = createAction(`[${ENCOUNTERDETECTION}] Get`, props<{queryParams: any}>());
export const getEncounterDetectionSuccess = createAction(`[${ENCOUNTERDETECTION}] Get Success`, props<{model: string, filterData: EncounterDetection}>());
export const getEncounterDetectionFailure = createAction(`[${ENCOUNTERDETECTION}] Get Failure`, props<{errorMessage: string}>());