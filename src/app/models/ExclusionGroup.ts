import {User} from './User';

export interface ExclusionGroup {
  id: number;
  name: string;
  notes?: string;
  prevented_encounters: number;
  school_id: number;
  users: User[];
  enabled: boolean;
  created: Date;
  last_updated: Date;
}
