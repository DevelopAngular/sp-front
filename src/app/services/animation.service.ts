import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() { }

  animationDone$: Subject<boolean> = new Subject<boolean>();

  get animationDone() {
    return this.animationDone$.asObservable();
  }
}
