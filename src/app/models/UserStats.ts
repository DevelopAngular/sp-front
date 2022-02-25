import {HallPass} from './HallPass';
import {Report} from './Report';

export interface UserStats {
  expired_passes: HallPass[];
  out_of_class_seconds: number;
  over_time_limit: number;
  auto_ended: number;
  reports: Report[];
}