import {ApplicationRef, Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {filter, first, map, switchMap, take} from 'rxjs/operators';
import {concat, interval, Subject} from 'rxjs';
import {AdminService} from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  needToUpdate$: Subject<{active: boolean, color: any}> = new Subject<{active: boolean, color: any}>();

  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private adminService: AdminService
  ) {

    updates.available.pipe(
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
