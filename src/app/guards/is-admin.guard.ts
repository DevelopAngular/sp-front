import {Injectable, NgZone} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../services/user.service';
import {map} from 'rxjs/operators';
import {DeviceDetection} from '../device-detection.helper';
import {StorageService} from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdminGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
    private _zone: NgZone,
    private storageService: StorageService
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.userService.userData
            .pipe(
              map((user) => {
                if (this.storageService.getItem('initialUrl')) {
                  this.router.navigate([this.storageService.getItem('initialUrl')]);
                  this.storageService.removeItem('initialUrl');
                }
                if (!user.isAdmin() || (user.isAdmin() && user.isTeacher() && DeviceDetection.isMobile())) {
                  this._zone.run(() => {
                    this.router.navigate(['main/passes']);
                  });
                }
                return true;
              })
            );
  }
}
