import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pinnable } from '../../../models/Pinnable';
import { HttpService } from '../../../http-service';
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
  isLastStep: boolean;
  pastState: string;

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
     this.nextStep('from');
    }
  }

  nextStep(step) {
    if (step) {
        if (this.historyState.past.includes(step)) {
            if (this.isLastStep) {
                this.isLastStep = false;
                console.log('PASTSTATE ==>>>>', this.pastState);
                return this.changeLocation$.next(this.pastState);
            }
            if (step !== 'toWhere') {
              this.isLastStep = true;
              this.pastState = this.changeLocation$.value;
            }
            console.log('HISTORY1 ===>>>>>', this.changeLocation$.value);
             this.changeLocation$.next(step);
             this.historyState.past = _.uniq(this.historyState.past);
            return;
        }
        if (!this.changeLocation$.value) {
            if (!this.forFuture && !this.toStudents) {
                this.historyState.past.push('from');
            }
            if (this.forFuture) {
              this.historyState.past.push('date');
            }
            if (this.toStudents) {
              this.historyState.past.push('students');
            }
        } else {
          this.historyState.past.push(this.changeLocation$.value);
        }
        this.historyState.index = this.historyState.past.length - 1;
        console.log('HISTORY2 ===>>>>>', this.historyState);
        this.changeLocation$.next(step);
    }
  }

  back() {
    if (!this.historyState.index || !this.historyState.past[this.historyState.index]) {
      if (this.toStudents) {
          console.log('Students ===>>> ', this.historyState);
        return this.changeLocation$.next('students');
      }
      if (this.forFuture) {
          console.log('Date ===>>> ', this.historyState);
        return this.changeLocation$.next('date');
      }
      if (this.historyState.past[this.historyState.index] === 'from') {
          this.historyState.past = [];
          console.log('FROM ===>>> ', this.historyState);
          return this.changeLocation$.next('from');
      }
        console.log('EXIT ===>>>', this.historyState);
        return this.changeLocation$.next('exit');
    } else {
        console.log('BACK HISTORY2 ===>>>', this.historyState);
        this.changeLocation$.next(this.historyState.past[this.historyState.index]);
        this.historyState.index -= 1;
        _.remove(this.historyState.past, (el) => {
            return el === this.changeLocation$.value;
        });
    }
  }

  clearHistory() {
      this.historyState.index = null;
      this.historyState.past = [];
      this.forFuture = false;
      this.toStudents = false;
      this.isLastStep = false;
  }
}
