import {createAction, props} from '@ngrx/store';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';
import {User} from '../../../models/User';
import {ProfilePicturesUploadGroup} from '../../../models/ProfilePicturesUploadGroup';
import {ProfilePicturesError} from '../../../models/ProfilePicturesError';

const PPICRURES = 'Profile Pictures';

export const createUploadGroup = createAction(`[${PPICRURES}] Create Upload Group`);
export const createUploadGroupSuccess = createAction(`[${PPICRURES}] Create Upload Group Success`, props<{group: ProfilePicturesUploadGroup}>());
export const createUploadGroupFailure = createAction(`[${PPICRURES}] Create Upload Group Failure`, props<{errorMessage: string}>());

export const postProfilePictures = createAction(`[${PPICRURES}] Post Profile Pictures`, props<{pictures: File[], userIds: string[] | number[]}>());
export const postProfilePicturesSuccess = createAction(`[${PPICRURES}] Post Profile Pictures Success`, props<{images: ProfilePicture[]}>());
export const postProfilePicturesFailure = createAction(`[${PPICRURES}] Post Profile Pictures Failure`, props<{errorMessage: string}>());

export const setProfilePictureToGoogle = createAction(`[${PPICRURES}] Set Profile Picture To Google`, props<{urls: string[], files: File[], content_types: string[], userIds: string[] | number[], images_data: any}>());
export const setProfilePictureToGoogleSuccess = createAction(`[${PPICRURES}] Set Profile Picture To Google Success`);
export const setProfilePictureToGoogleFailure = createAction(`[${PPICRURES}] Set Profile Picture To Google Failure`, props<{errorMessage: string}>());

export const mappingUserCollection = createAction(`[${PPICRURES}] Get User Collection`, props<{userIds: string[] | number[], images_data: any}>());
export const mappingUserCollectionFailure = createAction(`[${PPICRURES}] Get User Collection Failure`, props<{errorMessage: string}>());

export const uploadProfilePictures = createAction(`[${PPICRURES}] Upload Profile Pictures`, props<{students: User[], picturesData: {userId: number | string, pictureId: number | string}[]}>());
export const uploadProfilePicturesSuccess = createAction(`[${PPICRURES}] Upload Profile Pictures Success`, props<{profiles: ProfileMap[], users: User[]}>());
export const uploadProfilePicturesFailure = createAction(`[${PPICRURES}] Upload Profile Pictures Failure`, props<{errorMessage: string}>());

export const getUploadedErrors = createAction(`[${PPICRURES}] Get Uploaded Errors`, props<{group_id: number | string}>());
export const getUploadedErrorsSuccess = createAction(`[${PPICRURES}] Get Uploaded Errors Success`, props<{errors: ProfilePicturesError[]}>());
export const getUploadedErrorsFailure = createAction(`[${PPICRURES}] Get Uploaded Errors Failure`, props<{errorMessage: string}>());

export const putUploadErrors = createAction(`[${PPICRURES}] Put Upload Errors`, props<{errors: any}>());
export const putUploadErrorsSuccess = createAction(`[${PPICRURES}] Put Upload Errors Success`, props<{errors: ProfilePicturesError[]}>());
export const putUploadErrorsFailure = createAction(`[${PPICRURES}] Put Upload Errors Failure`, props<{errorMessage: string}>());

export const clearProfilePicturesUploadErrors = createAction(`[${PPICRURES}] Clear Upload Errors`);

export const getProfilePicturesUploadedGroups = createAction(`[${PPICRURES}] Get Uploaded Groups`);
export const getProfilePicturesUploadedGroupsSuccess = createAction(`[${PPICRURES}] Get Uploaded Groups Success`, props<{groups: ProfilePicturesUploadGroup[]}>());
export const getProfilePicturesUploadedGroupsFailure = createAction(`[${PPICRURES}] Get Uploaded Groups Failure`, props<{errorMessage: string}>());

export const getMissingProfilePictures = createAction(`[${PPICRURES}] Missing Profile Pictures`);
export const getMissingProfilePicturesSuccess = createAction(`[${PPICRURES}] Missing Profile Pictures Success`, props<{profiles: User[]}>());
export const getMissingProfilePicturesFailure = createAction(`[${PPICRURES}] Missing Profile Pictures Failure`, props<{errorMessage: string}>());

export const showErrorToast = createAction(`[${PPICRURES}] Show Error Toast`);

export const changeProfilePictureLoader = createAction(`[${PPICRURES}] Change Loader`, props<{percent: number}>());


