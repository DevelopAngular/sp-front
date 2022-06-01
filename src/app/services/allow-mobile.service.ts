import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, Observable, combineLatest} from 'rxjs';
import {tap, map, takeUntil} from 'rxjs/operators';

import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from './user.service';
import {HttpService} from './http-service';
import {DeviceDetection} from '../device-detection.helper';

@Injectable({
  providedIn: 'root'
})
export class AllowMobileService {

  public canUseMobile$ = new BehaviorSubject<boolean>(true);

  currentUser$ = this.userService.userData.asObservable();
  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private loginService: GoogleLoginService,
      private userService: UserService,
      private httpService: HttpService,
  ) {
    combineLatest(
      this.userService.userData.asObservable(),
      this.httpService.currentSchool$
    ).pipe(
      map(([u,s]) => {
        if (
          u.isStudent() && 
          !s.student_can_use_mobile &&
          DeviceDetection.isMobile()
        ) {
          // assumes the user is logged in
          // log out the user
          this.httpService.clearInternal();
          this.loginService.clearInternal();
          return false;
        }

        return true;
      }),
      takeUntil(this.destroy$)
    ).subscribe(v => {
      this.canUseMobile$.next(v);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
