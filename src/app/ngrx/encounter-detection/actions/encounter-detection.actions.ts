import { createAction, props } from '@ngrx/store';
import { EncounterDetection } from '../../../models/EncounterDetection';

const ENCOUNTERDETECTION = 'Encounter Detection';

export const getEncounterDetection = createAction(`[${ENCOUNTERDETECTION}] Get Encounter Detection`, props<{ url: string }>());
export const getEncounterDetectionSuccess = createAction(
	`[${ENCOUNTERDETECTION}] Get Encounter Detection Success`,
	props<{ encounterDetection: EncounterDetection[]; createdAt: Date }>()
);
export const getEncounterDetectionFailure = createAction(
	`[${ENCOUNTERDETECTION}] Get Encounter Detection Failure`,
	props<{ errorMessage: string }>()
);
