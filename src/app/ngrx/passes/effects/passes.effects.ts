import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HallPassesService } from '../../../services/hall-passes.service';

import {catchError, concatMap, map, take} from 'rxjs/operators';
import { of } from 'rxjs';

import * as passesActions from '../actions';
import { HallPass } from '../../../models/HallPass';

@Injectable()
export class PassesEffects {

  searchPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passesActions.searchPasses),
        concatMap((action: any) => {
          return this.hallPassesService.searchPasses(action.url)
            .pipe(
              map(({results, next}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                return passesActions.searchPassesSuccess({passes: results, next: nextUrl});
              }),
              catchError(error => of(passesActions.searchPassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMorePasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passesActions.getMorePasses),
        concatMap((action) => {
          return this.hallPassesService.passesNextUrl$.pipe(take(1));
        }),
        concatMap((url) => {
          return this.hallPassesService.searchPasses(url)
            .pipe(
              map(({results, next}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                return passesActions.getMorePassesSuccess({passes: results, next: nextUrl});
              }),
              catchError(error => of(passesActions.getMorePassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private hallPassesService: HallPassesService
  ) {
  }
}
