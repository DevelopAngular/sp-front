import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as toastActions from '../actions';
import {map} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';


@Injectable()
export class ToastEffects {

  constructor(private actions$: Actions, private toast: ToastService) {
  }

  openToast$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(toastActions.openToastAction),
        map((action: any) => {
          let id = action.id;
          if (!action.id) {
            id = `${Math.floor(Math.random() * 1000)}`;
          }
          return toastActions.openToastActionSuccess({data: action.data, id});
        })
      );
  });

  closeToast$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(toastActions.closeToastAction),
        map((action: any) => {
          return toastActions.closeToastActionSuccess({ids: action.ids});
        })
      );
  });
}
