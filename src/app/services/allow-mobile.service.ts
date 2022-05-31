import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, Observable, combineLatest} from 'rxjs';
import {tap, map, takeUntil} from 'rxjs/operators';

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
      private userService: UserService,
      private httpService: HttpService,
  ) {
    combineLatest(
      this.userService.userData.asObservable(),
      this.httpService.currentSchool$
    ).pipe(
      tap(([u, s]) => {
        console.log('comb', u, s)
      }),
      map(([u,s]) => {
        if (
          u.isStudent() && 
          !s.student_can_use_mobile &&
          DeviceDetection.isMobile()
        ) return false;

        return true;
      }),
      takeUntil(this.destroy$)
    ).subscribe(v => {
      console.log('comb', v);
      this.canUseMobile$.next(v);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
