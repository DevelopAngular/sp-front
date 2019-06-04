import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {KioskModeService} from './services/kiosk-mode.service';

@Injectable({
  providedIn: 'root'
})
export class NotKioskModeGuard implements CanActivate {
  constructor(
    private kioskMode: KioskModeService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // return true;
    // if (!!this.kioskMode.currentRoom$.value) {
    //   this.router.navigate(['main', 'myroom']);
    // }
    return !this.kioskMode.currentRoom$.value;
  }
}
