import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map, switchMap, tap} from 'rxjs/operators';
import {of, zip} from 'rxjs';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';
import {User} from '../../../models/User';
import {ToastService} from '../../../services/toast.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../app-state/app-state';

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
                const urls = images.map(prof => prof.upload_url);
                const content_types = images.map(prof => prof.content_type);
                const images_data = images.reduce((acc, pic, index) => {
                  return {...acc, [action.userIds[index]]: pic.id };
                }, {});
                return [
                  profilePicturesActions.changeProfilePictureLoader({percent: 5}),
                  profilePicturesActions.setProfilePictureToGoogle({
                    urls,
                    files: action.pictures,
                    content_types,
                    images_data,
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
          const count = action.files.length;
          let i = 5;
          const requests$ = action.urls.map((url, index) => {
            return this.userService.setProfilePictureToGoogle(url, action.files[index], action.content_types[index])
              .pipe(
                tap(() => {
                  i += (80 / count);
                  this.store.dispatch(profilePicturesActions.changeProfilePictureLoader({percent: Math.ceil(i)}));
                }));
          });
          return zip(...requests$).pipe(
            switchMap((res) => {
              return [
                profilePicturesActions.setProfilePictureToGoogleSuccess(),
                profilePicturesActions.mappingUserCollection({images_data: action.images_data, userIds: action.userIds})
              ];
            }),
            catchError(error => of(profilePicturesActions.setProfilePictureToGoogleFailure({errorMessage: error.message})))
          );
        })
      );
  });

  mappingUserCollection$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.mappingUserCollection),
        exhaustMap((action: any) => {
          return zip(
            this.userService.getUsersList('_profile_student', '', null, true),
            this.userService.getUsersList('_profile_teacher', '', null, true),
            this.userService.getUsersList('_profile_assistant', '', null, true)
          ).pipe(
            map(([students, teachers, assistants]) => [...students, ...teachers, ...assistants]),
            map((students: User[]) => {
              return students.reduce((acc, user) => {
                if (user.extras.clever_student_number) {
                  return { ...acc, [user.extras.clever_student_number]: user };
                }
                return { ...acc, [user.primary_email]: user };
              }, {});
            }),
            map((students) => {
              return action.userIds.map((id, index) => {
                if (students[id]) {
                  return students[id];
                } else {
                  this.userService.profilePicturesErrors$.next({'User ID': id, error: 'No user with this id was found'});
                }
              });
            }),
            switchMap((students) => {
              const picturesData: {userId: string | number, pictureId: number | string}[] = students.filter(s => !!s).map((s: User) => {
                const pictureId = s.extras.clever_student_number ?
                  action.images_data[s.extras.clever_student_number] :
                  action.images_data[s.primary_email];
                return { userId: s.id, pictureId};
              });
              return [
                profilePicturesActions.changeProfilePictureLoader({percent: 90}),
                profilePicturesActions.uploadProfilePictures({picturesData, students})
              ];
            }),
            catchError(error => of(profilePicturesActions.mappingUserCollectionFailure({errorMessage: error.message})))
          );
        })
      );
  });

  uploadProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePictures),
        exhaustMap((action: any) => {
          if (action.picturesData.length) {
            return this.userService.uploadProfilePictures(action.picturesData.map(d => d.pictureId), action.picturesData.map(d => d.userId))
              .pipe(
                switchMap(({attached_photos}: {attached_photos: ProfileMap[]}) => {
                  return [
                    profilePicturesActions.changeProfilePictureLoader({percent: 100}),
                    profilePicturesActions.uploadProfilePicturesSuccess({profiles: attached_photos, users: action.students})
                  ];
                }),
                catchError(error => of(profilePicturesActions.uploadProfilePicturesFailure({errorMessage: error.message})))
              );
          } else {
            return [profilePicturesActions.uploadProfilePicturesFailure({errorMessage: 'Please check if the data is correct'})];
          }
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
    private toastService: ToastService,
    private store: Store<AppState>
  ) {
  }
}
