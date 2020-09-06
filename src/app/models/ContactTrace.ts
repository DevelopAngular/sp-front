import {HallPass} from './HallPass';
import {User} from './User';

export interface ContactTrace {
  contact_passes: {contact_pass: HallPass, student_pass: HallPass}[];
  contact_paths: Array<User[]>;
  degree: number;
  initial_contact_date: Date;
  student: User;
  total_contact_duration: number; // seconds
}
