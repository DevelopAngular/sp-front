import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../../../services/user.service';
import * as assistantsActions from '../actions';
import {catchError, concatMap, map, switchMap} from 'rxjs/operators';
import {User} from '../../../../../models/User';
import {forkJoin, of, zip} from 'rxjs';

@Injectable()
export class AssistantsEffects {
  getAssistants$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.getAssistants),
        concatMap((action: any) => {
          return this.userService.getUsersList(action.role, action.search, action.limit)
            .pipe(
              switchMap((userlist: any[]) => {
                if (!userlist.length) {
                  return of({
                    users: [],
                    representedUsers: []
                  });
                }
                return forkJoin({
                  users: of(userlist),
                  representedUsers: zip(...userlist.map(user => this.userService.getRepresentedUsers(user.id)))

                });
              }),
              map(({users, representedUsers}) => {
                if (!users.length) {
                  return [];
                }
                return users.map((user, index) => {
                  return {
                    ...user,
                    canActingOnBehalfOf: representedUsers[index]
                  };
                });
              }),
              map((users: User[]) => {
                return assistantsActions.getAssistantsSuccess({assistants: users});
              }),
              catchError(error => of(assistantsActions.getAssistantsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeAssistant$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(assistantsActions.removeAssistant),
        concatMap((action: any) => {
          return this.userService.deleteUserFromProfile(action.id, 'assistant')
            .pipe(
              map(user => {
                return assistantsActions.removeAssistantSuccess({id: action.id});
              }),
              catchError(error => of(assistantsActions.removeAssistantFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
