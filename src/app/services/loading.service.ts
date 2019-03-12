import { Injectable } from '@angular/core';
import { concat, EMPTY } from 'rxjs';

import 'rxjs/add/operator/scan';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private changes: ReplaySubject<number> = new ReplaySubject<number>();

  isLoading$ = this.changes.scan((acc, value) => acc + value, 0).map(num => num > 0);

  constructor() {
  }

  run<T>(func: () => T): T {
    try {
      this.changes.next(1);
      return func();
    } finally {
      this.changes.next(-1);
    }
  }

  increment() {
    this.changes.next(1);
  }

  decrement() {
    this.changes.next(-1);
  }

  watch<T>(): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      return concat<T>(
        EMPTY.pipe(tap(null, null, () => this.changes.next(1))),
        source
      ).pipe(tap(null, () => this.changes.next(-1), () => this.changes.next(-1)));
    };
  }

  get watchFirst(): <T>(source: Observable<T>) => Observable<T> {
    let hasEmitted = false;
    const doEmit = () => {
      if (!hasEmitted) {
        this.changes.next(-1);
        hasEmitted = true;
      }
    };
    return <T>(source: Observable<T>): Observable<T> => {
      return concat<T>(
        EMPTY.pipe(tap(null, null, () => this.changes.next(1))),
        source
      ).pipe(tap(doEmit, doEmit, doEmit));
    };
  }

  async register<T>(f: Promise<T> | Observable<T>): Promise<T> {
    if (f instanceof Observable) {
      f = f.toPromise();
    }

    try {
      this.changes.next(1);
      return await f;
    } finally {
      this.changes.next(-1);
    }
  }

}
