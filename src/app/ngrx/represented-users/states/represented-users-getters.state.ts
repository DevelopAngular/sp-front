import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IRepresentedUsersState} from './represented-users.state';

export const getRepresentedUsersState = (state: AppState) => state.representedUsers;

export const getRepresentedUsersCollections = createSelector(
  getRepresentedUsersState,
  (state: IRepresentedUsersState) => state.rUsers
);

export const getEffectiveUser = createSelector(
  getRepresentedUsersState,
  (state: IRepresentedUsersState) => state.effectiveUser
);
