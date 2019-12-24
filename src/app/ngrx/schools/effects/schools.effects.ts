import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpService } from '../../../services/http-service';
import * as schoolsActions from '../actions';
import { catchError, concatMap, map } from 'rxjs/operators';
import { School } from '../../../models/School';
import { of } from 'rxjs';
import {AdminService} from '../../../services/admin.service';
import {GG4LSync} from '../../../models/GG4LSync';

@Injectable()
export class SchoolsEffects {

  getSchools$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(schoolsActions.getSchools),
      concatMap(action => {
        return this.http.getSchools()
          .pipe(
            map((schools: School[]) => {
              return schoolsActions.getSchoolsSuccess({schools});
            }),
            catchError(error => of(schoolsActions.getSchoolsFailure({errorMessage: error.message})))
          );
      })
    );
  });

  getGG4LInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(schoolsActions.getSchoolsGG4LInfo),
      concatMap(action => {
        return this.adminService.getGG4LSyncInfo()
          .pipe(
            map((gg4lInfo: GG4LSync) => {
              return schoolsActions.getSchoolsGG4LInfoSuccess({gg4lInfo});
            }),
            catchError(error => of(schoolsActions.getSchoolsGG4LInfoFailure({errorMessage: error.message})))
          );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private http: HttpService,
    private adminService: AdminService
  ) {}
}
