import {Action, createReducer, on} from '@ngrx/store';
import {IContactTraceStates} from '../states';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ContactTrace} from '../../../models/ContactTrace';
import * as contactTraceActions from '../actions';

export const adapter: EntityAdapter<ContactTrace> = createEntityAdapter<ContactTrace>();

export const contactTraceInitialState: IContactTraceStates = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  contactTraceInitialState,
  on(contactTraceActions.getContacts, state => ({...state, loading: true, loaded: false})),
  on(contactTraceActions.getContactsSuccess, (state, {contacts_trace}) => {
    return adapter.addAll(contacts_trace, {...state, loading: false, loaded: true});
  })
);


export function contactTraceReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
