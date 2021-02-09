import {createSelector} from '@ngrx/store';
import {getPassLikeCollectionState} from '../../../states/pass-like-getters.state';
import {IInvitationsState} from './invitations.state';
import {adapter} from '../reducers';
import {IPassLikeCollectionState} from '../../../states/pass-like-collection.state';

export const getInvitationsState = createSelector(
  getPassLikeCollectionState,
  (state: IPassLikeCollectionState) => state.invitations
);

export const getInvitationLoadingState = createSelector(
  getInvitationsState,
  (state: IInvitationsState) => state.loading
);

export const getInvitationLoadedState = createSelector(
  getInvitationsState,
  (state: IInvitationsState) => state.loaded
);

export const getInvitationsCollection = adapter.getSelectors(getInvitationsState).selectAll;
export const getInvitationsTotalNumber = adapter.getSelectors(getInvitationsState).selectTotal;
