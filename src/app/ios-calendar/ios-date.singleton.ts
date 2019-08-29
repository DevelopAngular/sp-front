import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import * as moment from 'moment';
import {Moment} from 'moment';

@Injectable({
  providedIn: 'root'
})
export class IosDateSingleton {

  public dateSubject: BehaviorSubject<Moment> = new BehaviorSubject<Moment>(moment());

  constructor() { }

  getDate(): Observable<Moment> {
    return this.dateSubject.asObservable();
  }
  setDate(date: Moment) {
    // console.log(date);
    this.dateSubject.next(date);
  }
}
