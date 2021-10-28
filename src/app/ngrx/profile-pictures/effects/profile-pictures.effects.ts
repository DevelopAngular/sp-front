import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, map, switchMap, take, tap} from 'rxjs/operators';
import {of, zip} from 'rxjs';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {User} from '../../../models/User';
import {ToastService} from '../../../services/toast.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../app-state/app-state';
import {ProfilePicturesUploadGroup} from '../../../models/ProfilePicturesUploadGroup';
import {ProfilePicturesError} from '../../../models/ProfilePicturesError';
import {deleteAccountPicture} from '../../accounts/actions/accounts.actions';
import {PollingService} from '../../../services/polling-service';

@Injectable()
export class ProfilePicturesEffects {

  createUploadGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.createUploadGroup),
        switchMap(() => {
          return this.userService.createUploadGroup()
            .pipe(
              map((group: ProfilePicturesUploadGroup) => {
                return profilePicturesActions.createUploadGroupSuccess({group});
              }),
              catchError(error => of(profilePicturesActions.createUploadGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

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
                  profilePicturesActions.createUploadGroup(),
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
                  return { ...acc, [user.extras.clever_student_number]: user, [user.primary_email]: user };
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
                const pictureId = action.images_data[s.extras.clever_student_number] || action.images_data[s.primary_email];
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
            return this.userService.currentUploadedGroup$.pipe(
              take(1),
              switchMap((uploadedGroup: ProfilePicturesUploadGroup) => {
                return this.userService.uploadProfilePictures(action.picturesData.map(d => d.pictureId), action.picturesData.map(d => d.userId), uploadedGroup.id)
                  .pipe(
                    switchMap((data) => {
                      return [
                        profilePicturesActions.changeProfilePictureLoader({percent: 95}),
                        profilePicturesActions.uploadProfilePicturesSuccess({users: action.students})
                      ];
                    }),
                    catchError(error => of(profilePicturesActions.uploadProfilePicturesFailure({errorMessage: error.message})))
                  );
              })
            );
          } else {
            return [profilePicturesActions.uploadProfilePicturesFailure({errorMessage: 'Please check if the data is correct'})];
          }
        })
      );
  });

  uploadProfilePicturesSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.uploadProfilePicturesSuccess),
        exhaustMap((action: any) => {
          return this.pollingService.listen('admin.profile_pictures.attach_profile_pics_end')
            .pipe(
              switchMap(({data}) => {
                return [
                  profilePicturesActions.changeProfilePictureLoader({percent: 100}),
                  profilePicturesActions.uploadPicturesComplete({profiles: data.attached_pictures, users: action.users})
                ];
              }),
              catchError(error => of(profilePicturesActions.uploadPicturesError({errorMessage: error.message})))
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

  putUploadErrors$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.putUploadErrors),
        switchMap((action: any) => {
          return this.userService.currentUploadedGroup$
            .pipe(
              take(1),
              switchMap((uploadedGroup: ProfilePicturesUploadGroup) => {
                const levels = action.errors.map((e) => 'error');
                const messages = action.errors.map((e) => {
                  return `${Object.keys(e)[0]}: ${e[Object.keys(e)[0]]}` + ' => ' + e.error;
                });
                return this.userService.putProfilePicturesErrors(uploadedGroup.id, levels, messages)
                  .pipe(
                    map((errors: ProfilePicturesError[]) => {
                      return profilePicturesActions.putUploadErrorsSuccess({errors});
                    }),
                    catchError(error => of(profilePicturesActions.putUploadErrorsFailure({errorMessage: error.message})))
                  );
              })
            );
        })
      );
  });

  getUploadedGroups$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.getProfilePicturesUploadedGroups),
        switchMap((action) => {
          return this.userService.getUploadedGroups()
            .pipe(
              map((groups: ProfilePicturesUploadGroup[]) => {
                return profilePicturesActions.getProfilePicturesUploadedGroupsSuccess({groups});
              }),
              catchError(error => of(profilePicturesActions.getProfilePicturesUploadedGroupsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getMissingProfilePictures$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.getMissingProfilePictures),
        switchMap((actions) => {
          return this.userService.getMissingProfilePictures()
            .pipe(
              map((profiles: User[]) => {
                return profilePicturesActions.getMissingProfilePicturesSuccess({profiles});
              }),
              catchError(error => of(profilePicturesActions.getMissingProfilePicturesFailure({errorMessage: error.message})))
            );
        })
      );
  });

  getUploadedErrors$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.getUploadedErrors),
        exhaustMap((action) => {
          return this.userService.getUploadedErrors(action.group_id)
            .pipe(
              map((errors: ProfilePicturesError[]) => {
                return profilePicturesActions.getUploadedErrorsSuccess({errors});
              }),
              catchError(error => of(profilePicturesActions.getUploadedErrorsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  deleteProfilePicture$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(profilePicturesActions.deleteProfilePicture),
        exhaustMap((action: any) => {
          return this.userService.uploadProfilePictures(-1, action.user.id)
            .pipe(
              switchMap(() => {
                const updatedUser = { ...action.user, profile_picture: null };
                return [
                  deleteAccountPicture({user: updatedUser, role: action.role}),
                  profilePicturesActions.deleteProfilePictureSuccess()
                ];
              }),
              catchError(error => of(profilePicturesActions.deleteProfilePictureFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private toastService: ToastService,
    private store: Store<AppState>,
    private pollingService: PollingService
  ) {
  }
}
