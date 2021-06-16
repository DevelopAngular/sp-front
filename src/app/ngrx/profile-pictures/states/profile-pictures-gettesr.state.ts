import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IProfilePicturesState} from './profile-pictures.state';
import {adapter} from '../reducers';

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
