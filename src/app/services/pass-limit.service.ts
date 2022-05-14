import { Injectable } from '@angular/core';
import {HttpService} from './http-service';
import {Observable} from 'rxjs';
import {HallPassLimit} from '../models/HallPassLimits';

@Injectable({
  providedIn: 'root'
})
export class PassLimitService {

  constructor(private http: HttpService) {}

  getPassLimit(): Observable<{ pass_limit: HallPassLimit }> {
    return this.http.get<{ pass_limit: HallPassLimit }>(`http://localhost:8000/api/staging/v1/pass_limits/`);
  }

  createPassLimit(pl: HallPassLimit) {
    return this.http.post('http://localhost:8000/api/staging/v1/pass_limits/create', pl, undefined, false);
  }

  getRemainingLimits({studentId}: { studentId: number | string}): Observable<{ remainingPasses: number }> {
    return this.http.get<{remainingPasses: number}>(`http://localhost:8000/api/staging/v1/pass_limits/remaining?student_id=${studentId}`);
  }

  updatePassLimits(pl: HallPassLimit) {
    return this.http.put('http://localhost:8000/api/staging/v1/pass_limits/update', pl);
  }
}
