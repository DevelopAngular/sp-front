import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map, switchMap} from 'rxjs/operators';
import {of, zip} from 'rxjs';

@Injectable()
export class ProfilePicturesEffects {

  uploadProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePictures),
        exhaustMap((action: any) => {
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
              switchMap((profiles: any[]) => {
                const urls =  profiles.map(prof => prof.upload_url);
                const content_types = profiles.map(prof => prof.content_type);
                return [profilePicturesActions.setProfilePictureToGoogle({ urls, files: action.pictures,  content_types }), profilePicturesActions.postProfilePicturesSuccess({profiles})];
              }),
              catchError(error => of(profilePicturesActions.postProfilePicturesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  postProfilePicturesToGoogle$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.setProfilePictureToGoogle),
        exhaustMap((action: any) => {
          const requests$ = action.urls.map((url, index) => {
            return this.userService.setProfilePictureToGoogle(url, action.files[index], action.content_types[index]);
          });
          return zip(...requests$).pipe(
            map((res) => {
              return profilePicturesActions.setProfilePictureToGoogleSuccess();
            }),
            catchError(error => of(profilePicturesActions.setProfilePictureToGoogleFailure({errorMessage: error.message})))
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
