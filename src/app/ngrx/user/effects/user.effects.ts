import {Injectable} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as userActions from '../actions';
import * as accountsActions from '../../accounts/actions/accounts.actions';
import {catchError, concatMap, exhaustMap, map, mapTo, switchMap} from 'rxjs/operators';
import {User} from '../../../models/User';
import {of} from 'rxjs';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';

@Injectable()
export class UserEffects {

  getUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.getUser),
        concatMap(action => {
          return this.userService.getUser()
            .pipe(
              map((user: User) => {
                return userActions.getUserSuccess({user});
              }),
              catchError(error => of(userActions.getUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getUserPin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.getUserPinAction),
        concatMap(action => {
          return this.userService.getUserPin()
            .pipe(
              map(({pin}) => {
                return userActions.getUserPinSuccess({pin});
              }),
              catchError(error => of(userActions.getUserPinFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateUser$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserAction),
        concatMap((action: any) => {
          return this.userService.updateUser(action.user.id, action.data)
            .pipe(
              map((user: User) => {
                if (action.data.pin) {
                  return userActions.updateUserPin({pin: action.data.pin});
                }
                return userActions.updateUserSuccess({user});
              }),
              catchError(error => of(userActions.updateUserFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateUserSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserSuccess),
        map((action: any) => {
          return accountsActions.updateAccounts({account: action.user});
        })
      );
  });

  updateUserPin$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserPin),
        map((action) => {
          return userActions.updateUserPinSuccess({pin: action.pin});
        })
      );
  });

  updateProfilePicture$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(userActions.updateUserPicture),
        exhaustMap((action) => {
          return this.userService.bulkAddProfilePictures([action.file])
            .pipe(
              switchMap((images: ProfilePicture[]) => {
                return this.userService.setProfilePictureToGoogle(images[0].upload_url, action.file, images[0].content_type)
                  .pipe(mapTo(images[0]));
              }),
              switchMap((image) => {
                return this.userService.uploadProfilePictures([+image.id], [action.user.id]);
              }),
              map(({attached_photos}: {attached_photos: ProfileMap[]}) => {
                return { ...action.user, profile_picture: attached_photos[0].photo_url};
              }),
              map((user: User) => userActions.updateUserPictureSuccess({user})),
              catchError(error => of(userActions.updateUserPictureFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getUserStats$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.getUserStats),
      switchMap((action) => {
        return this.userService.getUserStats(action.userId, action.queryParams)
          .pipe(
            map(stats => {
              return userActions.getUserStatsSuccess({stats});
            }),
            catchError(error => of(userActions.getUserStatsFailure({errorMessage: error.message})))
          );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
