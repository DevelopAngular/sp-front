import {ElementRef, Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DomCheckerService {
  domElement$: Subject<ElementRef<HTMLElement>> = new Subject<ElementRef<HTMLElement>>();
  scalePassCard$: Subject<'open' | 'close'> = new Subject<'open' | 'close'>();

  constructor() { }
}
