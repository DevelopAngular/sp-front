import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideNavService {

  constructor() {
  }

  public sideNavData$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public  sideNavAction$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public sideNavType$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public  toggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public toggleLeft$: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(false);

  public toggleRight$: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(false);

  public  fadeClick$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get sideNavData() {
    return this.sideNavData$.asObservable();
  }

  get sideNavAction() {
    return this.sideNavAction$.asObservable();
  }

  get toggle() {
    return this.toggle$.asObservable();
  }

  get toggleLeft() {
    return this.toggleLeft$.asObservable();
  }

  get toggleRight() {
    return this.toggleRight$.asObservable();
  }

  get sideNavType() {
    return this.sideNavType$.asObservable();
  }

  get fadeClick() {
    return this.fadeClick$.asObservable();
  }
}
