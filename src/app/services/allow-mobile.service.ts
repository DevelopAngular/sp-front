import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject, Observable, combineLatest} from 'rxjs';
import {Router} from '@angular/router';
import {tap, map, takeUntil} from 'rxjs/operators';

import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from './user.service';
import {HttpService} from './http-service';
import {DeviceDetection} from '../device-detection.helper';

@Injectable({
  providedIn: 'root'
})
export class AllowMobileService implements OnDestroy {

  public canUseMobile$ = new BehaviorSubject<boolean>(true);

  currentUser$ = this.userService.userData.asObservable();
  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private loginService: GoogleLoginService,
      private userService: UserService,
      private httpService: HttpService,
      private router: Router,
  ) {
    combineLatest(
      this.loginService.isAuthenticated$,
      this.userService.userData.asObservable(),
      this.httpService.currentSchool$
    ).pipe(
      map(([isAuthenticated, user, school]) => {
        console.log('allow', isAuthenticated, user.isStudent(), school.student_can_use_mobile)
        if (
          isAuthenticated &&
          DeviceDetection.isMobile() &&
          user.isStudent() && 
          !school.student_can_use_mobile
        ) {
          return false;
        }

        return true;
      }),
      takeUntil(this.destroy$)
    ).subscribe(v => {
      this.canUseMobile$.next(v);
    });
  }

  clearInternal() {
    // log out the user
    this.httpService.clearInternal();
    this.loginService.clearInternal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
