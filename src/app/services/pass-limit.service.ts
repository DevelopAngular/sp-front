import { Injectable } from '@angular/core';
import {HttpService} from './http-service';
import {Observable, of} from 'rxjs';
import {HallPassLimit} from '../models/HallPassLimits';
import {concatMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PassLimitService {

  constructor(private http: HttpService) {}

  getPassLimit(): Observable<{ pass_limit: HallPassLimit }> {
    return this.http.currentSchool$.pipe(
      concatMap(school => this.http.get<{ pass_limit: HallPassLimit }>(`http://localhost:8000/api/staging/v1/pass_limits/?school_id=${school.id}`))
    );
  }

  createPassLimit(pl: HallPassLimit) {
    return this.http.currentSchool$.pipe(
      concatMap(school => {
        pl.schoolId = parseInt(school.id, 10);
        console.log(pl);
        return this.http.post('http://localhost:8000/api/staging/v1/pass_limits/create', pl, undefined, false);
      })
    );
  }

  getRemainingLimits({studentId}: { studentId: number | string}): Observable<{ remainingPasses: number }> {
    return this.http.currentSchool$.pipe(
      concatMap(school => {
        return this.http.get<{remainingPasses: number}>(`http://localhost:8000/api/staging/v1/pass_limits/remaining?school_id=${school.id}&student_id=${studentId}`);
      })
    );
  }

  updatePassLimits(pl: HallPassLimit) {
    return this.http.currentSchool$.pipe(
      concatMap(school => {
        pl.schoolId = parseInt(school.id, 10);
        console.log(pl);
        return this.http.put('http://localhost:8000/api/staging/v1/pass_limits/update', pl);
      })
    );
  }
}
