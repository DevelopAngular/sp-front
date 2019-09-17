import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';
import {combineLatest, filter, map, tap} from 'rxjs/operators';
import { User } from '../models/User';
import {StorageService} from '../services/storage.service';
import { DeviceDetection } from '../device-detection.helper';

@Injectable({
  providedIn: 'root'
})
export class NotSeenIntroGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandler,
    private storage: StorageService
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // console.log('canActivate intro:', localStorage.getItem('smartpass_intro') !== 'seen');
    return this.userService.getUserRequest()
      .pipe(
        map(raw => User.fromJSON(raw)),
        combineLatest(this.userService.getIntros()),
        map(([user, intros]: [any, any]) => {
          if (!user) {
            return false;
          }
          let isSaveOnServer;
          if (DeviceDetection.isAndroid() && intros.main_intro.android.seen_version) {
              isSaveOnServer = true;
          } else if (DeviceDetection.isIOSMobile() && intros.main_intro.ios.seen_version) {
              isSaveOnServer = true;
          } else if (intros.main_intro.web.seen_version) {
              isSaveOnServer = true;
            }
          if (user.isStudent()) {
            if (this.storage.getItem('smartpass_intro_student') !== 'seen' && !isSaveOnServer) {
              this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
            }
          } else if (user.isTeacher()) {
            if (this.storage.getItem('smartpass_intro_teacher') !== 'seen' && !isSaveOnServer) {
              this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
            }
          }
          return true;
        })
      );
    }
}
