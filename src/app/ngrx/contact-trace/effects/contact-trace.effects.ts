import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ContactTraceService} from '../../../services/contact-trace.service';
import {catchError, concatMap, map} from 'rxjs/operators';
import {ContactTrace} from '../../../models/ContactTrace';
import * as contactTraceActions from '../actions';
import {of} from 'rxjs';

@Injectable()
export class ContactTraceEffects {

  getContacts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(contactTraceActions.getContacts),
        concatMap((action: any) => {
          return this.contactTraceService.getContacts(action.studentsIds, action.start_time)
            .pipe(
              map(({results}: {results: ContactTrace[]}) => {
                return contactTraceActions.getContactsSuccess({contacts_trace: results});
              }),
              catchError(error => of(contactTraceActions.getContactsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private contactTraceService: ContactTraceService
  ) {
  }
}
