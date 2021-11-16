import {User} from './User';

export interface PreventEncounters {
  created: Date;
  destination: string;
  first_name: string;
  id: number;
  last_name: string;
  origin: string;
  pass_end: Date;
  pass_time: Date;
}

export interface ExclusionGroup {
  id?: number;
  name: string;
  notes: string;
  prevented_encounters?: PreventEncounters[];
  school_id?: number;
  users: User[];
  enabled?: boolean;
  created?: Date;
  last_updated?: Date;
}
