import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {HallPassesService} from '../../../services/hall-passes.service';

import {catchError, concatMap, map, switchMap, take} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';

import * as passesActions from '../actions';
import {HallPass} from '../../../models/HallPass';

@Injectable()
export class PassesEffects {

  searchPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passesActions.searchPasses),
        switchMap((action: any) => {
          return this.hallPassesService.searchPasses(action.url)
            .pipe(
              map(({results, next, count}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                return passesActions.searchPassesSuccess({passes: results, next: nextUrl, totalCount: count});
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

  sortPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passesActions.sortPasses),
        switchMap((action) => forkJoin({
          action: of(action),
          limit: this.hallPassesService.currentPassesCount$.pipe(take(1))
        })),
        concatMap(({action, limit}) => {
          const queryParams = {...action.queryParams, limit};
          return this.hallPassesService.sortHallPasses(queryParams)
            .pipe(
              map(({next, results}: {next: string, results: HallPass[]}) => {
                const nextUrl = next ? next.substring(next.search('v1')) : null;
                const sortValue = action.queryParams.sort ? action.queryParams.sort.includes('-') ? 'desc' : 'asc' : '';
                return passesActions.sortPassesSuccess({next: nextUrl, passes: results, sortValue});
              }),
              catchError(error => of(passesActions.sortPassesFailure({errorMessage: error.message})))
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
