import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Location } from '../models/Location';

@Injectable({
  providedIn: 'root'
})
export class KioskModeService {

  public currentRoom$: BehaviorSubject<Location> = new BehaviorSubject(null);

  constructor() { }
}
