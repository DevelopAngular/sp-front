import {Action, createReducer, on} from '@ngrx/store';
import {AssistantsStates} from '../states';
import * as assistantsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const assistantsInitialState: AssistantsStates = adapter.getInitialState({
  loading: false,
  loaded: false,
  nextRequest: null,
  lastAddedAssistants: [],
  sortValue: ''
});

const reducer = createReducer(
  assistantsInitialState,
  on(assistantsActions.getAssistants,
      assistantsActions.removeAssistant,
    assistantsActions.getMoreAssistants,
      state => ({...state, loading: true, loaded: false })),
  on(assistantsActions.getAssistantsSuccess, (state, {assistants, next}) => {
    return adapter.addAll(assistants, {...state, loading: false, loaded: true, nextRequest: next, lastAddedAssistants: [] });
  }),
  on(assistantsActions.removeAssistantSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(
    assistantsActions.updateAssistantActivitySuccess,
    assistantsActions.updateAssistantAccount,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true});
  }),
  on(
    assistantsActions.removeRepresentedUserSuccess,
    assistantsActions.addRepresentedUserSuccess,
    assistantsActions.updateAssistantPermissionsSuccess,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state});
  }),
  on(assistantsActions.getMoreAssistantsSuccess, (state, {assistants, next}) => {
    return adapter.addMany(assistants, {...state, lastAddedAssistants: assistants, nextRequest: next});
  }),
  on(assistantsActions.postAssistantSuccess, assistantsActions.addUserToAssistantProfileSuccess, (state, {assistant}) => {
    return adapter.addOne(assistant, {...state, loading: false, loaded: true});
  }),
  on(assistantsActions.getMoreAssistantsFailure, (state, {errorMessage}) => ({...state, loading: false, loaded: true})),
  on(assistantsActions.bulkAddAssistantAccounts, (state, {assistants}) => {
    return adapter.addMany(assistants, {...state});
  }),
  on(assistantsActions.sortAssistantAccountsSuccess, (state, {assistants, next, sortValue}) => {
    return adapter.addAll(assistants, {...state, loading: false, loaded: true, nextRequest: next, sortValue});
  })
);

export function assistantsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
