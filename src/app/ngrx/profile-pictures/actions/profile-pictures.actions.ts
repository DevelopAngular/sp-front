import {createAction, props} from '@ngrx/store';

const PPICRURES = 'Profile Pictures';

export const uploadProfilePictures = createAction(`[${PPICRURES}] Upload Profile Pictures`, props<{csvFile: File, pictures: File[]}>());
export const uploadProfilePicturesSuccess = createAction(`[${PPICRURES}] Upload Profile Pictures Success`, props<{data: any, pictures: File[]}>());
export const uploadProfilePicturesFailure = createAction(`[${PPICRURES}] Upload Profile Pictures Failure`, props<{errorMessage: string}>());

export const postProfilePictures = createAction(`[${PPICRURES}] Post Profile Pictures`, props<{uuid: any, pictures: File[]}>());
export const postProfilePicturesSuccess = createAction(`[${PPICRURES}] Post Profile Pictures Success`, props<{profiles: any}>());
export const postProfilePicturesFailure = createAction(`[${PPICRURES}] Post Profile Pictures Failure`, props<{errorMessage: string}>());

export const setProfilePictureToGoogle = createAction(`[${PPICRURES}] Set Profile Picture To Google`, props<{urls: string[], files: File[], content_types: string[]}>());
export const setProfilePictureToGoogleSuccess = createAction(`[${PPICRURES}] Set Profile Picture To Google Success`);
export const setProfilePictureToGoogleFailure = createAction(`[${PPICRURES}] Set Profile Picture To Google Failure`, props<{errorMessage: string}>());


