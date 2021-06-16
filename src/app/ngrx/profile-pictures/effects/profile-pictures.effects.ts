import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map, switchMap} from 'rxjs/operators';
import {of, zip} from 'rxjs';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';

@Injectable()
export class ProfilePicturesEffects {

  postProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.postProfilePictures),
        exhaustMap((action: any) => {
          return this.userService.bulkAddProfilePictures(action.pictures)
            .pipe(
              switchMap((images: ProfilePicture[]) => {
                const urls =  images.map(prof => prof.upload_url);
                const content_types = images.map(prof => prof.content_type);
                const images_ids = images.map(p => p.id);
                return [
                  profilePicturesActions.setProfilePictureToGoogle({ urls, files: action.pictures,  content_types }),
                  profilePicturesActions.uploadProfilePictures({picturesIds: images_ids, userIds: action.userIds}),
                  profilePicturesActions.postProfilePicturesSuccess({images})
                ];
              }),
              catchError(error => of(profilePicturesActions.postProfilePicturesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  uploadProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePictures),
        exhaustMap((action: any) => {
          return this.userService.uploadProfilePictures(action.picturesIds, action.userIds)
            .pipe(
              map(({attached_photos}: {attached_photos: ProfileMap[]}) => {
                return profilePicturesActions.uploadProfilePicturesSuccess({profiles: attached_photos});
              }),
              catchError(error => of(profilePicturesActions.uploadProfilePicturesFailure({errorMessage: error.message})))
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
