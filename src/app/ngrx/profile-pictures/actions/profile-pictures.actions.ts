import {createAction, props} from '@ngrx/store';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';

const PPICRURES = 'Profile Pictures';

export const postProfilePictures = createAction(`[${PPICRURES}] Post Profile Pictures`, props<{pictures: File[], userIds: string[] | number[]}>());
export const postProfilePicturesSuccess = createAction(`[${PPICRURES}] Post Profile Pictures Success`, props<{images: ProfilePicture[]}>());
export const postProfilePicturesFailure = createAction(`[${PPICRURES}] Post Profile Pictures Failure`, props<{errorMessage: string}>());

export const uploadProfilePictures = createAction(`[${PPICRURES}] Upload Profile Pictures`, props<{userIds: string[] | number[], picturesIds: string[] | number[]}>());
export const uploadProfilePicturesSuccess = createAction(`[${PPICRURES}] Upload Profile Pictures Success`, props<{profiles: ProfileMap[]}>());
export const uploadProfilePicturesFailure = createAction(`[${PPICRURES}] Upload Profile Pictures Failure`, props<{errorMessage: string}>());

export const setProfilePictureToGoogle = createAction(`[${PPICRURES}] Set Profile Picture To Google`, props<{urls: string[], files: File[], content_types: string[]}>());
export const setProfilePictureToGoogleSuccess = createAction(`[${PPICRURES}] Set Profile Picture To Google Success`);
export const setProfilePictureToGoogleFailure = createAction(`[${PPICRURES}] Set Profile Picture To Google Failure`, props<{errorMessage: string}>());


