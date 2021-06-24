import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map, switchMap} from 'rxjs/operators';
import {of, zip} from 'rxjs';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';
import {User} from '../../../models/User';
import {Dictionary} from '@ngrx/entity';
import {ToastService} from '../../../services/toast.service';

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
                  profilePicturesActions.setProfilePictureToGoogle({
                    urls,
                    files: action.pictures,
                    content_types,
                    picturesIds: images_ids,
                    userIds: action.userIds
                  }),
                  profilePicturesActions.postProfilePicturesSuccess({images})
                ];
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
            switchMap((res) => {
              return [
                profilePicturesActions.setProfilePictureToGoogleSuccess(),
                profilePicturesActions.uploadProfilePictures({picturesIds: action.picturesIds, userIds: action.userIds})
              ];
            }),
            catchError(error => of(profilePicturesActions.setProfilePictureToGoogleFailure({errorMessage: error.message})))
          );
        })
      );
  });

  uploadProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePictures),
        exhaustMap((action: any) => {
          return this.userService.getUsersList('_profile_student', '', null, true)
            .pipe(
              map((students: User[]) => {
                return students.reduce((acc, user) => {
                  if (user.extras.clever_student_number) {
                    return { ...acc, [user.extras.clever_student_number]: user };
                  }
                  return { ...acc, [user.primary_email]: user };
                }, {});
              }),
              map((students: Dictionary<User>) => {
                return action.userIds.map((id, index) => {
                  if (students[id]) {
                    return students[id];
                  } else {
                    this.userService.profilePicturesErrors$.next({'User ID': id, error: 'No user with this id was found'});
                    action.picturesIds.splice(index, 1);
                  }
                });
              }),
              switchMap((students: User[]) => {
                const stud = students.filter(s => !!s).map(s => s.id);
                if (stud.length && action.picturesIds.length) {
                  return this.userService.uploadProfilePictures(action.picturesIds, stud)
                    .pipe(
                      map(({attached_photos}: {attached_photos: ProfileMap[]}) => {
                        return profilePicturesActions.uploadProfilePicturesSuccess({profiles: attached_photos, users: students});
                      }),
                      catchError(error => of(profilePicturesActions.uploadProfilePicturesFailure({errorMessage: error.message})))
                    );
                } else {
                  return [profilePicturesActions.uploadProfilePicturesFailure({errorMessage: 'Please check if the data is correct'})];
                }
              })
            );
        })
      );
  });

  uploadPicturesFailure$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePicturesFailure),
        map((action: any) => {
          this.toastService.openToast({title: 'Error', subtitle: action.errorMessage, type: 'error'});
          return profilePicturesActions.showErrorToast();
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private toastService: ToastService
  ) {
  }
}
