import {IInvitationsState} from '../nested-states/invitations/states';
import {IRequestsState} from '../nested-states/requests/states';
import {IExpiredPassesState} from '../nested-states/expired-passes/states';
import {IFuturePassesState} from '../nested-states/future-passes/states';
import {IActivePassesState} from '../nested-states/active-passes/states';
import {IToLocationState} from '../nested-states/to-location/states';
import {IFromLocationState} from '../nested-states/from-location/states';

export interface IPassLikeCollectionState {
  invitations?: IInvitationsState;
  requests?: IRequestsState;
  expiredPasses?: IExpiredPassesState;
  futurePasses?: IFuturePassesState;
  activePasses?: IActivePassesState;
  toLocation?: IToLocationState;
  fromLocation?: IFromLocationState;
}

export const passLikeCollectionInitialState: IPassLikeCollectionState = {};
