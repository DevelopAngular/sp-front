import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IProfilePicturesState} from './profile-pictures.state';
import {adapter} from '../reducers';
import {User} from '../../../models/User';

export const getProfilePicturesState = (state: AppState) => state.profilePictures;
export const getProfilePicturesCollection = adapter.getSelectors(getProfilePicturesState).selectAll;
export const getProfilePicturesEntities = adapter.getSelectors(getProfilePicturesState).selectEntities;

export const getProfilePicturesLoading = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.loading
);

export const getProfilePicturesLoaded = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.loaded
);

export const getProfilesMap = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.profilesMap
);

export const getUpdatedProfiles = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.updatedProfiles
);

export const getProfiles = createSelector(
  getProfilesMap,
  getUpdatedProfiles,
  (pm, up) => {
    return pm.map((profile) => {
      const user: User = up.filter(s => !!s).find(u => +u.id === profile.user_id);
      return {...user, profile_picture: profile.photo_url } as User;
    });
  }
);

export const getProfilePicturesLoaderPercent = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.loaderPercent
);

export const getCurrentUploadedGroup = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.currentUploadGroup
);

export const getUploadedGroups = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.uploadGroups
);

export const getLastUploadedGroup = createSelector(
  getUploadedGroups,
  (state) => state[state.length - 1]
);

export const getMissingProfiles = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.missingProfilesPictures
);

export const getUploadErrors = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.uploadErrors
);
