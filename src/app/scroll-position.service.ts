import { Injectable } from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {

  private scrollPositionHash: any = {};

  private scrollPositionHashSubject: ReplaySubject<any> = new ReplaySubject(1);

  public scrollPosition$: Observable<any> = this.scrollPositionHashSubject.asObservable();

  constructor() { }

  saveComponentScroll(componentName: string, scrollPosition: number) {
    this.scrollPositionHash[componentName] = scrollPosition;
    console.log(this.scrollPositionHash);
  }
  getComponentScroll(componentName: string) {
    return this.scrollPositionHash[componentName];
  }

}
