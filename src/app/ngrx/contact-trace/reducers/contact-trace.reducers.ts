import {Action, createReducer, on} from '@ngrx/store';
import {IContactTraceStates} from '../states';
import * as contactTraceActions from '../actions';

export const contactTraceInitialState: IContactTraceStates = {
  data: [],
  loading: false,
  loaded: false
};

const reducer = createReducer(
  contactTraceInitialState,
  on(contactTraceActions.getContacts, state => ({...state, loading: true, loaded: false})),
  on(contactTraceActions.getContactsSuccess, (state, {contacts_trace}) => {
    return {...state, loading: false, loaded: true, data: contacts_trace};
  }),
  on(contactTraceActions.clearContactTraceData, state => ({...state, loaded: false, loading: false, data: []}))
);


export function contactTraceReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
