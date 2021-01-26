import {IPassLikeCollectionState, passLikeCollectionInitialState} from '../states/pass-like-collection.state';
import {invitationsReducer} from '../nested-states/invitations/reducers';
import {requestsReducer} from '../nested-states/requests/reducers';
import {expiredPassesReducer} from '../nested-states/expired-passes/reducers';
import {futurePassesReducer} from '../nested-states/future-passes/reducers';
import {activePassesReducer} from '../nested-states/active-passes/reducers';

export function passLikeCollectionReducer(
  state = passLikeCollectionInitialState,
  action
): IPassLikeCollectionState {
  return {
    invitations: invitationsReducer(state.invitations, action),
    requests: requestsReducer(state.requests, action),
    expiredPasses: expiredPassesReducer(state.expiredPasses, action),
    futurePasses: futurePassesReducer(state.futurePasses, action),
    activePasses: activePassesReducer(state.activePasses, action)
  };
}
