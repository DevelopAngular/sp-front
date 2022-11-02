import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EncounterDetection } from '../models/EncounterDetection';
import { AppState } from '../ngrx/app-state/app-state';
import { HttpService } from './http-service';
// import { getEncounterDetection } from '../ngrx/schools/actions';
// import {getEncounterDetectionLoaded, getEncounterDetectionLoading, getEncounterDetectionState} from '../ngrx/schools/states';
import { HttpHeaders } from '@angular/common/http';
import {
  getEncounterDetection,
  getEncounterDetectionCollection, getEncounterDetectionDate,
  getEncounterDetectionErrored,
  getEncounterDetectionLoading
} from '../ngrx/encounter-detection';

@Injectable({
  providedIn: 'root'
})
export class EncounterDetectionService {

  encounteDetection$: Observable<EncounterDetection[]> = this.store.select(getEncounterDetectionCollection);
  encounterCreatedAt$: Observable<Date> = this.store.select(getEncounterDetectionDate);
  encounterLoading$: Observable<boolean> = this.store.select(getEncounterDetectionLoading);
  encounterErrored$: Observable<boolean> = this.store.select(getEncounterDetectionErrored);

  constructor(private http: HttpService, private store: Store<AppState>) { }


  getEncounterDetectionFunction(url) {
    return this.http.get(url);
  }

  getEncounterDetectionRequest(url: string) {
    this.store.dispatch(getEncounterDetection({url}));
  }

}
