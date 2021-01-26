import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap} from 'rxjs/operators';
import * as passLikeCollectionActions from '../actions';

@Injectable()
export class PassLikeCollectionEffects {

  getPassLikeCollection$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(passLikeCollectionActions.getPassLikeCollection),
        switchMap((action: any) => {
          return [
            passLikeCollectionActions.getInvitations({user: action.user}),
            passLikeCollectionActions.getRequests({user: action.user}),
            passLikeCollectionActions.getExpiredPasses({user: action.user})
          ];
        })
      );
  });

  constructor(private actions$: Actions) {}
}
