import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Request} from '../../../../../models/Request';
import {IRequestsState} from '../states';
import * as requestsActions from '../actions';

export const adapter: EntityAdapter<Request> = createEntityAdapter<Request>();

const requestsInitialStates: IRequestsState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  requestsInitialStates,
  on(requestsActions.getRequests, (state) => ({...state, loading: true, loaded: false})),
  on(requestsActions.getRequestsSuccess, (state, {requests}) => {
    return adapter.addAll(requests, {...state, loading: false, loaded: true});
  })
);

export function requestsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
