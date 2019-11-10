import {ElementRef, Injectable} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarElementsRefsService {

  constructor() { }

  public navbarRef$: Subject<ElementRef> = new ReplaySubject<ElementRef>(1);

  public schoolToggle$: Subject<ElementRef> = new ReplaySubject<ElementRef>(1);
}
