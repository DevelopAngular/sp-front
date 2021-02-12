import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IProfilePicturesState} from './profile-pictures.state';

export const getProfilePicturesState = (state: AppState) => state.profilePictures;

export const getProfilePictures = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.data
);

export const getProfilePicturesLoading = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.loading
);

export const getProfilePicturesLoaded = createSelector(
  getProfilePicturesState,
  (state: IProfilePicturesState) => state.loaded
);
