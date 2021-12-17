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
  conflict_pass_destination: string;
  conflict_pass_end: Date;
  conflict_pass_origin: string;
  conflict_pass_start_time: Date;
  conflict_pass_student_name: string;
  conflict_pass_staff_name: string;
}

export interface ExclusionGroup {
  id?: number;
  name: string;
  notes: string;
  prevented_encounters?: PreventEncounters[];
  school_id?: number;
  users: User[] | any;
  enabled?: boolean;
  created?: Date;
  last_updated?: Date;
}
