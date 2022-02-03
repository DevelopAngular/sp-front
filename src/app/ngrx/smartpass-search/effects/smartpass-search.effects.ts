import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as searchActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {of} from 'rxjs';

@Injectable()
export class SmartpassSearchEffects {

  search$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(searchActions.searchAction),
        switchMap((action: any) => {
          return this.userService.searchProfile('_profile_student', 50, action.searchValue)
            .pipe(
              map((searchResult) => {
                return searchActions.searchActionSuccess({searchResult: searchResult.results});
              }),
              catchError(error => of(searchActions.searchActionFailure({errorMessage: error.message})))
            );
        })
      );
  });


  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {
  }
}
