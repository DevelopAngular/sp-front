import {ApplicationRef, Injectable, OnDestroy} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {filter, first, map, switchMap, take, takeUntil} from 'rxjs/operators';
import {concat, interval, ReplaySubject, Subject} from 'rxjs';
import {AdminService} from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService implements OnDestroy{

  needToUpdate$: ReplaySubject<{active: boolean, color: any}> = new ReplaySubject<{active: boolean, color: any}>();

  destroy$ = new Subject();

  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private adminService: AdminService
  ) {

    updates.available.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.adminService.loadedColorProfiles$;
      }),
      take(1),
      switchMap(loaded => {
        if (loaded) {
          return this.adminService.colorProfiles$;
        } else {
          return this.adminService.getColorsRequest();
        }
      }),
      filter(r => !!r.length),
      map(colors => {
        return colors[Math.floor(Math.random() * colors.length)];
      })
    ).subscribe(color => {
      this.needToUpdate$.next({active: true, color});
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  check() {
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate());
  }

  update() {
    this.updates.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
