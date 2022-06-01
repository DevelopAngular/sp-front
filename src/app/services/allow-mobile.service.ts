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
      map(([user,school]) => {
        if (
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
