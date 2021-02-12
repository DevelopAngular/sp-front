import {IProfilePicturesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as profilePicturesActions from '../actions';

export const profilePicturesInitialState: IProfilePicturesState = {
  loaded: false,
  loading: false,
  data: null
};

const reducer = createReducer(
  profilePicturesInitialState,
  on(profilePicturesActions.uploadProfilePictures, (state) => ({...state, loading: true, loaded: false})),
  on(profilePicturesActions.postProfilePicturesSuccess, (state, {profiles}) => {
    return {...state, loading: false, loaded: true, data: profiles};
  })
);

export function profilePicturesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
