import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor() { }

  fadeClick$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get fadeClick() {
    return this.fadeClick$.asObservable();
  }
}
