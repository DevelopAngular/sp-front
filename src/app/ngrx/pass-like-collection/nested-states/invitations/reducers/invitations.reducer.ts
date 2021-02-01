import {Action, createReducer, on} from '@ngrx/store';
import {IInvitationsState} from '../states';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Invitation} from '../../../../../models/Invitation';
import * as invitationsActions from '../actions';

export const adapter: EntityAdapter<Invitation> = createEntityAdapter<Invitation>();

const invitationsInitialStates: IInvitationsState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  invitationsInitialStates,
  on(invitationsActions.getInvitations, (state) => ({...state, loading: true, loaded: false})),
  on(invitationsActions.getInvitationsSuccess, (state, {invitations}) => {
    return adapter.addAll(invitations, {...state, loading: false, loaded: true});
  })
);

export function invitationsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
