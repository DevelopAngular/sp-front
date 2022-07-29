import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { constructUrl } from '../live-data/helpers';
import { EncounterDetection } from '../models/EncounterDetection';
import { AppState } from '../ngrx/app-state/app-state';
import { getEncounterDetection } from '../ngrx/schools/actions';
import { HttpService } from './http-service';
import {getEncounterDetectionState} from '../ngrx/schools/states';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EncounterDetectionService {

  encounteDetection$: Observable<EncounterDetection> = this.store.select(getEncounterDetectionState);
  // passesLoaded$: Observable<EncounterDetection> = this.store.select(getEncounterDetectionState);

  constructor(private http: HttpService, private store: Store<AppState>) { }

  getEncounterDetection(url) {
    // const school = this.http.getSchool();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream',
      })
    };
    return this.http.get(url);
    // return this.http.get(constructUrl(`v1/schools/${school.id}/stats/encounter_detection`, {start_time, end_time}));
  }

  getEncounterDetectionRequest(url: string) {
    this.store.dispatch(getEncounterDetection({url}));
  }





  getContacts(studentIds: number[] | string[], start_time) {
    return this.http.post('v1/stats/contact_tracing', {students: studentIds, start_time});
  }

  
}
