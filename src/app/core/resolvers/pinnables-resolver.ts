import { Injectable } from '@angular/core';
import {Resolve} from '@angular/router';
import {Pinnable} from '../../models/Pinnable';
import {switchMap, take, tap} from 'rxjs/operators';
import {HallPassesService} from '../../services/hall-passes.service';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinnablesResolver implements Resolve<Pinnable[]> {

  constructor(
    private passesService: HallPassesService
  ) { }

  resolve(): Observable<Pinnable[]> {
    return of(navigator.onLine)
      .pipe(
        switchMap(connect => {
          if (connect) {
            return this.passesService.getPinnablesRequest();
          } else {
            return this.passesService.pinnables$;
          }
        }),
        take(1)
      );
  }
}
