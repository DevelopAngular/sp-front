import { Observable } from 'rxjs/Observable';
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

export interface PassLikeProvider {

  watch(sort: Observable<string>): Observable<PassLike[]>;

}
