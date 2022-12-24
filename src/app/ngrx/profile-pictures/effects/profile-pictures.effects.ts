import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '../../../services/user.service';
import * as profilePicturesActions from '../actions';
import {catchError, exhaustMap, last, map, mergeMap, switchMap, take, tap} from 'rxjs/operators';
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
import {School} from '../../../models/School';
import {updateSchoolSuccess} from '../../schools/actions';

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
                                  // lowercased as every search are performed on lowercased values
                                  const key = action.userIds[index].toLowerCase();
                                  // this should not happen
                                  if (!key) {
                                    // TODO throw exception?
                                    // or just return the previous accumulated object
                                    // as it nothing happened
                                    return acc;
                                  }
                                  return {...acc, [key]: pic.id};
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
                switchMap((action: any) => {
                    const count = action.files.length;
                    let i = 5;
                    const requests$ = action.urls.map((url, index) => {
                        return this.userService.setProfilePictureToGoogle(url, action.files[index], action.content_types[index])
                            .pipe(
                                tap(() => {
                                    i += (85 / count);
                                    this.store.dispatch(profilePicturesActions.changeProfilePictureLoader({percent: Math.ceil(i)}));
                                }));
                    });
                    return of(...requests$).pipe(
                        mergeMap(o => o, 10), // Execute only 10 requests at a time
                        last(), // Last emits the last projection after an observable completes.
                                // We use it here to wait for all the requests to complete.
                        switchMap((res) => {
                            return [
                                profilePicturesActions.setProfilePictureToGoogleSuccess(),
                                profilePicturesActions.mappingUserCollection({images_data: action.images_data, userIds: action.userIds})
                            ];
                        })
                    );
                }),
                catchError(error => of(profilePicturesActions.setProfilePictureToGoogleFailure({errorMessage: error.message})))
            );
    });

    mappingUserCollection$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(profilePicturesActions.mappingUserCollection),
                exhaustMap((action: any) => {
                  // TODO too cautionary?
                  // as this data is lowercased above
                  // used down to the pipe
                  /*  const images_data_lowercased = Object.keys(action.images_data).reduce((acc, k) => {
                      acc[k.toLowerCase()] = action.images_data[k];
                      return acc;
                    }, {});
                  */
                 const images_data_lowercased = action.images_data;

                    return zip(
                        this.userService.getUsersList('_profile_student', '', null, true),
                        this.userService.getUsersList('_profile_teacher', '', null, true),
                        this.userService.getUsersList('_profile_assistant', '', null, true)
                    ).pipe(
                        map(([students, teachers, assistants]) => [...students, ...teachers, ...assistants]),
                        map((students: User[]) => {
                            return students.reduce((acc, user) => {
                              // it is supposed to exist
                              // normalize it, as it can have user-esque shapes:
                              // most notable title cased
                              const primary_email = user?.primary_email.toLowerCase();
                              // this condition shouldn't happen
                              if (!primary_email) {
                                // TODO throw exception?
                                // or just return the previous accumulated object
                                // as it nothing happened
                                return acc;
                              }

                              if (user.primary_email.includes('@spnx.local')) {
                                  user.primary_email = primary_email.replace('@spnx.local', '');
                              }
                              if (user.extras.clever) {
                                  return {...acc, [user.extras.clever]: user, [primary_email]: user};
                              }
                              // TODO: is clever_student_number used anymore?
                              if (user.extras.clever_student_number) {
                                  return {...acc, [user.extras.clever_student_number]: user, [primary_email]: user};
                              }
                              return {...acc, [primary_email]: user};
                            }, {});
                        }),
                        map((students) => {
                            const found = action.userIds.map((rawId: string) => {
                              // sync with the keys on received students
                              // they are already lowercased
                              const id = rawId.toLowerCase();
                              if (id in students) {
                                  return students[id];
                              } else {
                                  // map returns here undefined
                                  this.userService.profilePicturesErrors$.next({'User ID': id, error: 'No user with this id was found'});
                              }
                            })
                            // filter here undefined values
                            .filter(Boolean);

                            if (found.length) {
                              return found;
                            }
                            throw new Error('Found no any acceptable record');
                        }),
                        switchMap((students) => {
                            const picturesData: { userId: string | number, pictureId: number | string }[] = students.filter(s => !!s).map((s: User) => {
                              const email = s.primary_email.toLowerCase();
                              let clever: string, clever_student_number: string;

                              if (!!s.extras) {
                                [clever, clever_student_number] = [s.extras.clever, s.extras.clever_student_number];
                              }

                              const pictureId = images_data_lowercased[email] ?? images_data_lowercased[clever] ?? images_data_lowercased[clever_student_number];
                              return {userId: s.id, pictureId};
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

    mappingUserCollectionFailure$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(profilePicturesActions.mappingUserCollectionFailure),
        map((action: any) => {
          this.toastService.openToast({title: 'Error', subtitle: action.errorMessage, type: 'error'});
          this.userService.profilePicturesErrorCancel$.next({error: action.errorMessage});

          return profilePicturesActions.showErrorToast();
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
                                const pictures = action.picturesData.map(d => d.pictureId);
                                const users = action.picturesData.map(d => d.userId);
                                return this.userService.uploadProfilePictures(pictures, users, uploadedGroup.id)
                                    .pipe(
                                      switchMap(data => {
                                        return of(this.userService.getUserSchool());
                                      }),
                                      switchMap((school) => {
                                        const updatedSchool: School = School.fromJSON({...school, profile_pictures_completed: true});
                                          return [
                                              profilePicturesActions.changeProfilePictureLoader({percent: 95}),
                                              updateSchoolSuccess({school: updatedSchool}),
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
      const actions$ = this.actions$.pipe(
        ofType(profilePicturesActions.uploadProfilePicturesSuccess),
      );

      return actions$
        .pipe(
          // this will ignore any action$ value
          // until its polling observable completes
          exhaustMap((action: any) => {
            return this.pollingService.listen('admin.profile_pictures.attach_profile_pics_end')
              .pipe(
                // this complete the polling
                // and makes exhaustMap take a fresh action
                take(1),
                switchMap((objdata: any) => {
                  const data = objdata.data;
                  return [
                    profilePicturesActions.changeProfilePictureLoader({percent: 100}),
                    profilePicturesActions.uploadPicturesComplete({profiles: data.attached_pictures, users: action.users})
                  ];
                }),
                catchError(error => of(profilePicturesActions.uploadPicturesError({errorMessage: error.message})))
              );
        }),
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
                                const updatedUser = {...action.user, profile_picture: null};
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
