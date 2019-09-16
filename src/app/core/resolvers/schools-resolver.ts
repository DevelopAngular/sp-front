import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {School} from '../../models/School';
import {Observable} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';
import {GoogleLoginService} from '../../services/google-login.service';
import {HttpService} from '../../services/http-service';

@Injectable({
  providedIn: 'root'
})
export class SchoolsResolver implements Resolve<School[]> {

  constructor(
    private loginService: GoogleLoginService,
    private http: HttpService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<School[]> | Promise<School[]> | School[] {
    return this.loginService.isAuthenticated$.pipe(
          filter(v => v),
          switchMap(() => {
            return this.http.schoolsLoaded$;
          }),
      switchMap(isLoaded => {
        if (isLoaded) {
          return this.http.schools$;
        } else {
          return this.http.getSchoolsRequest();
        }
      }),
      take(1)
    );
  }
}
