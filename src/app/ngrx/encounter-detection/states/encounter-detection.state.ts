import { EncounterDetection } from '../../../models/EncounterDetection';

export interface EncounterDetectionState {
    loading: boolean;
    error: boolean;
    encounterDetection: EncounterDetection[];
  }
