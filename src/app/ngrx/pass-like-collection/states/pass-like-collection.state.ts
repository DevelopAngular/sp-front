import {IInvitationsState} from '../nested-states/invitations/states';
import {IRequestsState} from '../nested-states/requests/states';
import {IExpiredPassesState} from '../nested-states/expired-passes/states';

export interface IPassLikeCollectionState {
  invitations?: IInvitationsState;
  requests?: IRequestsState;
  expiredPasses?: IExpiredPassesState;
}

export const passLikeCollectionInitialState: IPassLikeCollectionState = {};
