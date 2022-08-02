import { EntityState } from "@ngrx/entity";
import { EncounterDetection } from "../../../models/EncounterDetection";

export interface EncounterDetectionState extends EntityState<EncounterDetection> {
    loading: boolean;
    loaded: boolean;
    encounterDetection: EncounterDetection[]
  }