import { EncounterDetection } from '../../../models/EncounterDetection';

export interface EncounterDetectionState {
    loading: boolean;
    loaded: boolean;
    encounterDetection: EncounterDetection[];
  }
