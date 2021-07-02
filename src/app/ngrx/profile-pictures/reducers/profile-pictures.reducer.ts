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
  loaderPercent: 0
});

const reducer = createReducer(
  profilePicturesInitialState,
  on(
    profilePicturesActions.uploadProfilePictures, (state) => ({...state, loading: true, loaded: false})),
  on(profilePicturesActions.postProfilePicturesSuccess, (state, {images}) => {
    return adapter.addAll(images, {...state});
  }),
  on(profilePicturesActions.uploadProfilePicturesSuccess, (state, {profiles, users}) => {
    return {...state, loading: false, loaded: true, profilesMap: profiles, updatedProfiles: users};
  }),
  on(profilePicturesActions.changeProfilePictureLoader, (state, {percent}) => {
    return { ...state, loaderPercent: percent };
  })
);

export function profilePicturesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
