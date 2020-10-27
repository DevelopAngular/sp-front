import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as introsActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {of} from 'rxjs';

@Injectable()
export class IntrosEffects {

  getIntros$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.getIntros),
        switchMap((action: any) => {
          return this.userService.getIntros()
            .pipe(
              map(intros => {
                return introsActions.getIntrosSuccess({data: intros});
              }),
              catchError(error => of(introsActions.getIntrosFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntros$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntros),
        switchMap((action) => {
          debugger;
          return this.userService.updateIntros(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  main_intro: {
                    ...action.intros.main_intro,
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private action$: Actions,
    private userService: UserService
  ) {}

}
