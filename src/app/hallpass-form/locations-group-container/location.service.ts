import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  changeLocation$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor() {
  }
}
