import { Injectable } from '@angular/core';
import {Report} from '../../models/Report';
import {Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AdminService} from '../../services/admin.service';
import {switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportsResolver implements Resolve<Report[]> {

  constructor(
    private adminService: AdminService
  ) { }

  resolve(): Observable<Report[]> {
    return of(navigator.onLine)
      .pipe(
        switchMap(connection => {
        if (connection) {
            return this.adminService.getReportsData();
        } else {
          return this.adminService.reports.reports$;
        }
      }), take(1));
  }
}
