import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideNavService {

  constructor() {
  }

  public sideNavData$: Subject<any> = new Subject<any>();

  public  sideNavAction$: Subject<string> = new Subject<string>();

  public sideNavType$: Subject<string> = new Subject<string>();

  public  toggle$: Subject<boolean> = new Subject<boolean>();

  public toggleLeft$: Subject<boolean>  = new Subject<boolean>();

  public toggleRight$: Subject<boolean>  = new Subject<boolean>();

  public  fadeClick$: Subject<boolean> = new Subject<boolean>();

  public openSettingsEvent$: Subject<boolean> = new Subject<boolean>();

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
