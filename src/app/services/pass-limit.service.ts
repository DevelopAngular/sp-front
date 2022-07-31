import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

import {LiveDataService} from '../live-data/live-data.service';
import {HttpService} from './http-service';
import {HallPassLimit, IndividualPassLimit, IndividualPassLimitCollection, StudentPassLimit} from '../models/HallPassLimits';

const PASS_LIMIT_ENDPOINT = 'v1/pass_limits';

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
    return this.http.get<{ pass_limit: HallPassLimit }>(`${PASS_LIMIT_ENDPOINT}/`);
  }

  createPassLimit(pl: HallPassLimit) {
    return this.http.post(`${PASS_LIMIT_ENDPOINT}/create`, pl, undefined, false);
  }

  getRemainingLimits({studentId}: { studentId: number | string }): Observable<{ remainingPasses: number }> {
    return this.http.get<{ remainingPasses: number }>(`${PASS_LIMIT_ENDPOINT}/remaining?student_id=${studentId}`);
  }

  updatePassLimits(pl: HallPassLimit) {
    return this.http.put(`${PASS_LIMIT_ENDPOINT}/update`, pl);
  }

  getIndividualLimit(studentId: string | number): Observable<IndividualPassLimit> {
    return this.http.get(`${PASS_LIMIT_ENDPOINT}/individual_override?student_id=${studentId}`);
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

  watchIndividualPassLimit(studentId: number | string) {
      return this.liveDataService.watchIndividualPassLimit(studentId).pipe(
        map(d => d[0]),
        distinctUntilChanged((a, b) =>
          JSON.stringify(a) === JSON.stringify(b)
        ),
      );
  }

  getIndividualLimits(): Observable<IndividualPassLimit[]> {
    return this.http.get(`${PASS_LIMIT_ENDPOINT}/individual_overrides`);
  }

  createIndividualLimits(limit: IndividualPassLimitCollection) {
    return this.http.post(`${PASS_LIMIT_ENDPOINT}/create_override`, limit, undefined, false);
  }

  getStudentPassLimit(studentId: string | number): Observable<StudentPassLimit> {
    return this.http.get(`${PASS_LIMIT_ENDPOINT}/student_limit?student_id=${studentId}`);
  }

  updateIndividualLimit(override: IndividualPassLimitCollection): Observable<null> {
    return this.http.put<null>(`${PASS_LIMIT_ENDPOINT}/update_override`, override, undefined);
  }

  deleteIndividualLimit(studentId: string | number) {
    return this.http.delete(`${PASS_LIMIT_ENDPOINT}/delete_override?student_id=${studentId}`);
  }
}
