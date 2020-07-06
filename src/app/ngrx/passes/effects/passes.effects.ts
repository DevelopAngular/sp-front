import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HallPassesService } from '../../../services/hall-passes.service';

import { catchError, concatMap, map } from 'rxjs/operators';
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
              map((passes: HallPass[]) => {
                return passesActions.searchPassesSuccess({passes});
              }),
              catchError(error => of(passesActions.searchPassesFailure({errorMessage: error.message})))
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
