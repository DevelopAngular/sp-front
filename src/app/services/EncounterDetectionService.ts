import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EncounterDetection } from '../models/EncounterDetection';
import { AppState } from '../ngrx/app-state/app-state';
import { HttpService } from './http-service';
// import { getEncounterDetection } from '../ngrx/schools/actions';
// import {getEncounterDetectionLoaded, getEncounterDetectionLoading, getEncounterDetectionState} from '../ngrx/schools/states';
import { HttpHeaders } from '@angular/common/http';
import { getEncounterDetection, getEncounterDetectionCollection, getEncounterDetectionLoaded, getEncounterDetectionLoading } from '../ngrx/encounter-detection';

@Injectable({
  providedIn: 'root'
})
export class EncounterDetectionService {

  encounteDetection$: Observable<EncounterDetection[]> = this.store.select(getEncounterDetectionCollection);
  encounterLoaded$: Observable<boolean> = this.store.select(getEncounterDetectionLoaded);
  encounterLoading$: Observable<boolean> = this.store.select(getEncounterDetectionLoading);
  
  constructor(private http: HttpService, private store: Store<AppState>) { }
  
  
  getEncounterDetectionFunction(url) {
    console.log("Here")
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream',
      })
    };
    return this.http.get(url);
  }

  getEncounterDetectionRequest(url: string) {
    console.log("HEREEEEE")
    this.store.dispatch(getEncounterDetection({url}));
  }
  
}
