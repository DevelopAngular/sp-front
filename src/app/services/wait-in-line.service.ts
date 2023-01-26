import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { WaitInLine } from '../models/WaitInLine'

export enum WaitInLineState {
  CreatingPass,
  WaitingInLine,
  FrontOfLine,
  PassStarted,
  RequestWaiting
}

/**
 * This service contains any non-UI logic regarding Wait In Line.
 * This includes data parsing as well as http requests
 * Currently, it represents a mock server while the backend is being built.
 */
@Injectable({
  providedIn: 'root'
})
export class WaitInLineService {

  fakeWil = new BehaviorSubject<WaitInLine>(null);
  fakeWilActive = new BehaviorSubject<boolean>(false);
  fakeWilPasses = new BehaviorSubject<WaitInLine[]>([]);

  constructor() { }
}
