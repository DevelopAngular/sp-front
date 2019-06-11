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

  public  toggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get sideNavData() {
    return this.sideNavData$.asObservable();
  }

  get sideNavAction() {
    return this.sideNavAction$.asObservable();
  }

  get toggle() {
    return this.toggle$.asObservable();
  }
}
