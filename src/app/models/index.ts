import { HallPass } from './HallPass';
import { Invitation } from './Invitation';
import { Request } from './Request';

export interface Paged<T> {
  results: T[];
  prev: string;
  next: string;
}

export interface HallPassSummary {
  active_pass: HallPass;
  pass_history: HallPass[];
  future_passes: HallPass[];
}

export type PassLike = HallPass | Invitation | Request;

export function includesPassLike<T extends PassLike>(array: T[], item: T) {
  return array.find(p => p.id === item.id);
}

export function exceptPasses<T extends PassLike>(array: T[], excluded: T[]) {
  return array.filter(item => !includesPassLike(excluded, item));
}
