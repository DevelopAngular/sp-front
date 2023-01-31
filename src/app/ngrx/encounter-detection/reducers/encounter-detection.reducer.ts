import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { EncounterDetection } from '../../../models/EncounterDetection';
import { EncounterDetectionState } from '../states/encounter-detection.state';
import * as encounterDetectionActions from '../actions';

export const adapter: EntityAdapter<EncounterDetection> = createEntityAdapter<EncounterDetection>();

const encounterDetectionInitialState: EncounterDetectionState = {
	loading: true,
	error: false,
	encounterDetection: [],
	createdAt: null,
};

const reducer = createReducer(
	encounterDetectionInitialState,
	on(encounterDetectionActions.getEncounterDetection, (state) => ({ ...state, loading: true, error: false })),

	on(encounterDetectionActions.getEncounterDetectionSuccess, (state, { encounterDetection, createdAt }) => {
		return { ...state, loading: false, error: false, encounterDetection, createdAt };
	}),

	on(encounterDetectionActions.getEncounterDetectionFailure, (state, {}) => {
		return { ...state, loading: false, error: true };
	})
);

export function encounterDetectionReducer(state: any | undefined, action: Action) {
	return reducer(state, action);
}
