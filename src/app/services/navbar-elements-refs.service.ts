import {ElementRef, Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarElementsRefsService {

  constructor() { }

  public navbarRef$: Subject<ElementRef> = new Subject<ElementRef>();

  public schoolToggle$: BehaviorSubject<ElementRef> = new BehaviorSubject<ElementRef>(null);

  get navbarElement() {
    return this.navbarRef$.asObservable();
  }

  get schoolToggle() {
    return this.schoolToggle$.asObservable();
  }
}
