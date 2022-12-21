import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { WaitInLine } from '../models/WaitInLine'

@Injectable({
  providedIn: 'root'
})
export class WaitInLineService {

  fakeWil = new BehaviorSubject<WaitInLine>(null);
  fakeWilActive = new BehaviorSubject<boolean>(false);

  constructor() { }
}
