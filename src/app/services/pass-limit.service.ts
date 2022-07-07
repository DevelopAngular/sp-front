import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

import {LiveDataService} from '../live-data/live-data.service';
import {HttpService} from './http-service';
import {HallPassLimit, IndividualPassLimit} from '../models/HallPassLimits';

@Injectable({
  providedIn: 'root'
})
export class PassLimitService {

  constructor(
    private http: HttpService,
    private liveDataService: LiveDataService
  ) {
  }

  getPassLimit(): Observable<{ pass_limit: HallPassLimit }> {
    return this.http.get<{ pass_limit: HallPassLimit }>(`v1/pass_limits/`);
  }

  createPassLimit(pl: HallPassLimit) {
    return this.http.post('v1/pass_limits/create', pl, undefined, false);
  }

  getRemainingLimits({studentId}: { studentId: number | string }): Observable<{ remainingPasses: number }> {
    return this.http.get<{ remainingPasses: number }>(`v1/pass_limits/remaining?student_id=${studentId}`);
  }

  updatePassLimits(pl: HallPassLimit) {
    return this.http.put('v1/pass_limits/update', pl);
  }

  /**
   * Watches for create and update pass limit messages from the backend
   * and fetches the latest pass limit from the server
   */
  watchPassLimits() {
    return this.liveDataService.watchPassLimits().pipe(
      map(d => d[0]),
      distinctUntilChanged((a, b) => {
        return a.limitEnabled === b.limitEnabled && a.passLimit === b.passLimit;
      }),
    );
  }

  getIndividualLimits(): Observable<IndividualPassLimit[]> {
    return this.http.get('v1/pass_limits/individual_overrides');
  }
}
