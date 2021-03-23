import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as previewPassesActions from '../actions';
import {catchError, exhaustMap, map} from 'rxjs/operators';
import {HallPassesService} from '../../../services/hall-passes.service';
import {QuickPreviewPasses} from '../../../models/QuickPreviewPasses';
import {of} from 'rxjs';

@Injectable()
export class QuickPreviewPassesEffects {

  getPreviewPasses$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(previewPassesActions.getPreviewPasses),
        exhaustMap((action: any) => {
          return this.passesService.getQuickPreviewPasses(action.userId)
            .pipe(
              map((previewPasses: QuickPreviewPasses) => {
                return previewPassesActions.getPreviewPassesSuccess({previewPasses});
              }),
              catchError(error => of(previewPassesActions.getPreviewPassesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private passesService: HallPassesService
  ) {
  }
}
