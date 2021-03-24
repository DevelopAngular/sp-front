import {ElementRef, Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DomCheckerService {
  domElement$: Subject<ElementRef<HTMLElement>> = new Subject<ElementRef<HTMLElement>>();
  scalePassCardTrigger$: Subject<string> = new Subject<string>();
  fadeInOutTrigger$: Subject<'fadeIn' | 'fadeOut'> = new Subject<'fadeIn' | 'fadeOut'>();

  get scalePassCard() {
    return this.scalePassCardTrigger$.asObservable();
  }

  constructor() { }
}
