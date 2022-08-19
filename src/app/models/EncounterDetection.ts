import { User } from "./User";

export interface EncounterDetection {
    firstStudent?: User;
    secondStudent?: User;
    totalDuration: number;
    numberOfEncounters: number;
    encounters: any[]
  }