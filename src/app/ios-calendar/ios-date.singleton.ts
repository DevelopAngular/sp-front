import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import * as moment from 'moment';
import {Moment} from 'moment';

export const SWIPE_BLOCKER: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
export const DATE: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
export const HOUR: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
export const MINUTE: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


@Injectable({
  providedIn: 'root'
})
export class IosDateSingleton {
  // static blockerSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public minDate: BehaviorSubject<Moment> = new BehaviorSubject<Moment>(moment().add(5, 'minutes'));
  public dateSubject: BehaviorSubject<Moment> = new BehaviorSubject<Moment>(moment());

  constructor() { }

  getDate(): Observable<Moment> {
    return this.dateSubject.asObservable();
  }
  setDate(date: Moment) {
    // console.log(date._d);
    this.dateSubject.next(date);
  }
}
