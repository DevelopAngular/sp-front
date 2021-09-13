import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {

  private scrollPositionHash: any = {};

  constructor() { }

  saveComponentScroll(componentName: string, scrollPosition: number) {
    this.scrollPositionHash[componentName] = scrollPosition;
  }
  getComponentScroll(componentName: string) {
    return this.scrollPositionHash[componentName];
  }

}
