import {IProfilePicturesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as profilePicturesActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ProfilePicture} from '../../../models/ProfilePicture';

export const adapter: EntityAdapter<ProfilePicture> = createEntityAdapter<ProfilePicture>();

export const profilePicturesInitialState: IProfilePicturesState = adapter.getInitialState({
  loading: false,
  loaded: false,
  profilesMap: [],
  updatedProfiles: [],
  loaderPercent: 0,
  uploadGroups: [],
  currentUploadGroup: null,
  uploadErrors: [],
  missingProfilesPictures: []
});

const reducer = createReducer(
  profilePicturesInitialState,
  on(
    profilePicturesActions.postProfilePictures, (state) => ({...state, loading: true, loaded: false})),
  on(profilePicturesActions.postProfilePicturesSuccess, (state, {images}) => {
    return adapter.addAll(images, {...state});
  }),
  on(profilePicturesActions.uploadProfilePicturesSuccess, (state, {profiles, users}) => {
    return {...state, loading: false, loaded: true, profilesMap: profiles, updatedProfiles: users};
  }),
  on(profilePicturesActions.changeProfilePictureLoader, (state, {percent}) => {
    return { ...state, loaderPercent: percent };
  }),
  // on(profilePicturesActions.createUploadGroup, (state) => ({...state, currentUploadGroup: null})),
  on(profilePicturesActions.createUploadGroupSuccess, (state, {group}) => {
    return { ...state, uploadGroups: [...state.uploadGroups, group], currentUploadGroup: group };
  }),
  on(profilePicturesActions.putUploadErrorsSuccess, (state, {errors}) => {
    return { ...state, uploadErrors: [...state.uploadErrors, ...errors] };
  }),
  on(profilePicturesActions.getProfilePicturesUploadedGroupsSuccess, (state, {groups}) => {
    return { ...state, uploadGroups: groups };
  }),
  on(profilePicturesActions.getMissingProfilePicturesSuccess, (state, {profiles}) => {
    return { ...state, missingProfilesPictures: profiles };
  }),
  on(profilePicturesActions.getUploadedErrorsSuccess, (state, {errors}) => {
    return { ...state, uploadErrors: errors };
  })
);

export function profilePicturesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
