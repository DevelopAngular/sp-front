import { Injectable } from '@angular/core';
import {HttpService} from './http-service';
import {Observable} from 'rxjs';
import {HallPassLimit} from '../models/HallPassLimits';
import {concatMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PassLimitService {

  constructor(private http: HttpService) {}

  getPassLimit(): Observable<HallPassLimit> {
    return this.http.currentSchool$.pipe(
      concatMap(school => this.http.get<HallPassLimit>('v1/pass_limits/?school_id=' + school.id))
    );
  }
}
