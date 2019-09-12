import { Actions, createEffect, ofType } from '@ngrx/effects';
import {catchError, concatMap, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import * as pinnablesActions from '../actions';
import { HallPassesService } from '../../../services/hall-passes.service';
import { of } from 'rxjs';
import {Pinnable} from '../../../models/Pinnable';

@Injectable()
export class PinnablesEffects {

  getPinnables$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(pinnablesActions.getPinnables),
        concatMap((action: any) => {
          return this.passesService.getPinnables()
            .pipe(
              map(pinnables => {
                return pinnablesActions.getSuccessPinnable({ pinnables });
              }),
              catchError(error => of(pinnablesActions.getPinnablesFailure({ errorMessage: error.message }))));
        }));
  });

  postPinnable$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(pinnablesActions.postPinnables),
        concatMap((action: any) => {
          return this.passesService.createPinnable(action.data)
            .pipe(
              map((pinnable: Pinnable) => {
                return pinnablesActions.postPinnablesSuccess({pinnable: pinnable});
              }),
              catchError(error => of(pinnablesActions.postPinnablesFailure({ errorMessage: error.message })))
            );
        })
      );
  });

  removePinnable$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(pinnablesActions.removePinnable),
        concatMap((action: any) => {
          return this.passesService.deletePinnable(action.pinnable.id)
            .pipe(
              map(res => {
                return pinnablesActions.removeSuccessPinnable({pinnable: action.pinnable});
              }),
              catchError(error => of(pinnablesActions.removePinnableFailure({ errorMessage: error.message })))
            );
        })
      );
  });

  updatePinnable$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(pinnablesActions.updatePinnable),
        concatMap((action: any) => {
          return this.passesService.updatePinnable(action.id, action.pinnable)
            .pipe(
              map((pinnable: any) => {
                return pinnablesActions.updatePinnableSuccess({pinnable: pinnable});
              }),
              catchError(error => of(pinnablesActions.updatePinnableFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private passesService: HallPassesService
  ) {}
}
