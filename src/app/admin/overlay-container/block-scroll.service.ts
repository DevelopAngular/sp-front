import { Injectable } from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {filter} from  'rxjs/operators';

@Injectable()
export class BlockScrollService {

  private scrollSubject: Subject<boolean> = new Subject<boolean>();
  public scroll$: Observable<boolean>;

  constructor() {
    this.scroll$ = this.scrollSubject.asObservable().pipe<boolean>(filter<boolean>(Boolean));
  }

  doesScrolling(): void {
    this.scrollSubject.next(true);
  }
}
