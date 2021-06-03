import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable()
export class ProfilePicturesEffects {

  uploadProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePictures),
        exhaustMap((action: any) => {
          debugger;
          return this.userService.uploadProfilePictures(action.csvFile)
            .pipe(
              map(data => {
                return profilePicturesActions.uploadProfilePicturesSuccess({data, pictures: action.pictures});
              }),
              catchError(error => of(profilePicturesActions.uploadProfilePicturesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  uploadProfilePicturesSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePicturesSuccess),
        map((action: any) => {
          return profilePicturesActions.postProfilePictures({uuid: action.data.uuid, pictures: action.pictures});
        })
      );
  });

  postProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.postProfilePictures),
        exhaustMap((action: any) => {
          return this.userService.bulkAddProfilePictures(action.uuid, action.pictures)
            .pipe(
              map(profiles => {
                return profilePicturesActions.postProfilePicturesSuccess({profiles});
              }),
              catchError(error => of(profilePicturesActions.postProfilePicturesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {
  }
}
