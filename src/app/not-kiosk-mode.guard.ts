import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {KioskModeService} from './services/kiosk-mode.service';
import {StorageService} from './services/storage.service';
import {HttpService} from './services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class NotKioskModeGuard implements CanActivate {
  constructor(
    private kioskMode: KioskModeService,
    private router: Router,
    private http: HttpService,
    private storage: StorageService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // return true;
    // if (!!this.kioskMode.currentRoom$.value) {
    //   this.router.navigate(['main', 'myroom']);
    // }

    if (this.http.checkIfTokenIsKiosk()) {
      return this.router.parseUrl('main/kioskMode');
    }

    return  true;
  }
}
