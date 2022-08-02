import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { Action, createReducer, on } from "@ngrx/store";
import { EncounterDetection } from "../../../models/EncounterDetection";
import { EncounterDetectionState } from "../states/encounter-detection.state";
import * as encounterDetectionActions from '../actions';

export const adapter: EntityAdapter<EncounterDetection> = createEntityAdapter<EncounterDetection>();

const encounterDetectionInitialState: EncounterDetectionState = adapter.getInitialState({
    loading: false,
    loaded: false,
    encounterDetection: []
});

const reducer = createReducer(
    encounterDetectionInitialState,
    on(encounterDetectionActions.getEncounterDetection,
        state => ({ ...state, encoulterLoading: true, encounterLoaded: false })),

    on(encounterDetectionActions.getEncounterDetectionSuccess, (state, { encounterDetection }) => {
        return adapter.addAll(encounterDetection,{ ...state, encoulterLoading: false, encounterLoaded: true, encounterDetection });
    }),
);

export function encounterDetectionReducer(state: any | undefined, action: Action) {
    return reducer(state, action);
  }