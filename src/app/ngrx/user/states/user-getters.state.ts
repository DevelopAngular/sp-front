import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {UserState} from './user.state';

export const getUserState = (state: AppState) => state.user;

export const getUserData = createSelector(
  getUserState,
  (state: UserState) => state.user
);

export const getSelectUserPin = createSelector(
  getUserState,
  (state: UserState) => state.userPin
);

export const getLoadedUser = createSelector(
  getUserState,
  (state: UserState) => state.loaded
);

export const getNuxDates = createSelector(
  getUserState,
  (state: UserState) => state.nuxDates
);

export const getCurrentUpdatedUser = createSelector(
  getUserState,
  (state: UserState) => state.currentUpdatedUser
);
