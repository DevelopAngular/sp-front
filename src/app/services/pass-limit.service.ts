import { Injectable } from '@angular/core';
import {HttpService} from './http-service';
import {Observable, of} from 'rxjs';
import {HallPassLimit} from '../models/HallPassLimits';
import {catchError, concatMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PassLimitService {

  constructor(private http: HttpService) {}

  getPassLimit(): Observable<HallPassLimit> {
    return of<HallPassLimit>({
      id: 1,
      schoolId: 1,
      passLimit: 5,
      frequency: 'day',
      limitEnabled: true
    });
    // return this.http.currentSchool$.pipe(
    //   concatMap(school => { console.log('here 2'); return this.http.get<HallPassLimit>(`v1/pass_limits/?school_id=${school.id}`) }),
    //   catchError(() => {
    //     return of<HallPassLimit>({
    //       id: 1,
    //       schoolId: 1,
    //       passLimit: 5,
    //       frequency: 'day',
    //       limitEnabled: true
    //     })
    //   })
    // );
  }

  getRemainingLimits(): Observable<number> {
    return of(0);
  }
}
