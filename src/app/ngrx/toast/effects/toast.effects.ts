import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as toastActions from '../actions';
import {map, switchMap, take} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';


@Injectable()
export class ToastEffects {

  constructor(private actions$: Actions, private toast: ToastService) {
  }

  openToast$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(toastActions.openToastAction),
        switchMap((action: any) => {
          return this.toast.openedToastsIds$.pipe(
            take(1),
            map((ids: string[]) => {
              let id = action.id;
              if (!action.id) {
                id = `${Math.floor(Math.random() * 1000)}`;
                return toastActions.openToastActionSuccess({data: action.data, id});
              } else {
                if (ids.indexOf(id) !== -1) {
                  return toastActions.openToastFailure({errorMessage: 'You try to open the same toast'});
                }
                return toastActions.openToastActionSuccess({data: action.data, id});
              }
            })
          );
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
