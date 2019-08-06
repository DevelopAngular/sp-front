import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {

  private scrollPositionHash: any = {};

  constructor() { }

  saveComponentScroll(componentName: string, scrollPosition: number) {
    this.scrollPositionHash[componentName] = scrollPosition;
    console.log(this.scrollPositionHash);
  }
  getComponentScroll(componentName: string) {
    return this.scrollPositionHash[componentName];
  }

}
