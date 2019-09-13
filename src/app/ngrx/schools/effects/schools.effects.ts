import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpService } from '../../../services/http-service';
import * as schoolsActions from '../actions';
import {catchError, concatMap, map} from 'rxjs/operators';
import { School } from '../../../models/School';
import {of} from 'rxjs';

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

  constructor(
    private actions$: Actions,
    private http: HttpService
  ) {}
}
