import { EncounterDetectionService } from "../../../services/EncounterDetectionService";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, map } from "rxjs/operators";
import * as encounterDetectionActions from '../actions';
import { HttpErrorResponse } from '@angular/common/http'
import { ToastService } from '../../../services/toast.service'

@Injectable()
export class EncounterDetectionEffects {

    constructor(
      private actions$: Actions,
      private EDService: EncounterDetectionService,
      private toast: ToastService
    ) {}

    EncounterDetection$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(encounterDetectionActions.getEncounterDetection),
            concatMap(action => {
                return this.EDService.getEncounterDetectionFunction(action.url)
                    .pipe(
                        map(({results, created_at}) => {
                            return encounterDetectionActions.getEncounterDetectionSuccess(
                              { encounterDetection: results, createdAt: created_at});
                        }),
                        catchError((error: HttpErrorResponse) => {
                          console.log(error);
                          if (error.status !== 404) {
                            this.toast.openToast(
                              {
                                title: 'Oh no! Something went wrong',
                                subtitle: `Please try refreshing the page. If the issue keeps occurring, contact us at support@smartpass.app. (${error.status})`,
                                type: 'error'
                              }, error.status.toString());
                          }

                          return of(encounterDetectionActions.getEncounterDetectionFailure({ errorMessage: error.message }));
                        })
                    );
            })
        );
    });


}
