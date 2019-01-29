import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pinnable } from '../../models/Pinnable';
import { HttpService } from '../../http-service';
import { MatDialog } from '@angular/material';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  changeLocation$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  historyState: {
    past: string[],
    index: number
  } = {
      past: [],
      index: null
  };
  forFuture: boolean;
  toStudents: boolean;

  constructor(private http: HttpService, public dialog: MatDialog) {
  }

  getPinnable() {
    return this.http.get<any[]>('v1/pinnables/arranged')
        .toPromise()
        .then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  firstStep(toDate: boolean, toStudents: boolean) {
    if (!this.historyState.index) {
     this.forFuture = toDate;
     this.toStudents = toStudents;
     if (this.forFuture && this.toStudents) {
       return this.changeLocation$.next('toWhere');
     }
     this.changeLocation$.next('from');
    }
  }

  nextStep(step) {
    if (step) {
        this.historyState.past.push(this.changeLocation$.value);
        this.historyState.index += 1;
        console.log('HISTORY ===>>>>>', this.historyState);
        this.changeLocation$.next(step);
    }
  }

  back() {
    if (!this.historyState.index) {
      if (this.toStudents) {
        return this.changeLocation$.next('students');
      }
      if (this.forFuture) {
        return this.changeLocation$.next('date');
      }
        return this.changeLocation$.next('exit');
    } else {
        this.historyState.index -= 1;
        console.log('BACK HISTORY ===>>>', this.historyState);
        this.changeLocation$.next(this.historyState.past[this.historyState.index]);
        _.remove(this.historyState.past, (el) => {
            return el === this.changeLocation$.value;
        });
    }
  }
}
