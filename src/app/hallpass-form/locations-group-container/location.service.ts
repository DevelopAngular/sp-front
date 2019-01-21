import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pinnable } from '../../models/Pinnable';
import {HttpService} from '../../http-service';
import {MatDialog} from '@angular/material';

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
      index: 0
  };

  constructor(private http: HttpService, public dialog: MatDialog) {
  }

  getPinnable() {
    return this.http.get<any[]>('v1/pinnables/arranged')
        .toPromise()
        .then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  nextStep(step) {
    this.historyState.past.push(this.changeLocation$.value);
    this.historyState.index += 1;
    this.changeLocation$.next(step);
  }

  back(close: boolean = false) {
    this.historyState.index -= 1;
    if (!this.historyState.index) {
      // this.dialog.closeAll();
      if (close) {
        this.dialog.closeAll();
      }
      this.changeLocation$.next('exit');
    }
    this.changeLocation$.next(this.historyState.past[this.historyState.index]);
  }
}
