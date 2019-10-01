import {createSelector} from '@ngrx/store';
import {getAccountsState, IAccountsState} from '../../../states';
import {adapter} from '../reducers';
import {AssistantsStates} from './assistants.states';

export const getAssistantsAccountsProfiles = createSelector(
  getAccountsState,
  (state: IAccountsState) => state.assistantsAccounts
);

export const getLoadedAssistants = createSelector(
  getAssistantsAccountsProfiles,
  (state: AssistantsStates) => state.loaded
);

export const getLoadingAssistants = createSelector(
  getAssistantsAccountsProfiles,
  (state: AssistantsStates) => state.loading
);

export const getCountAssistants = adapter.getSelectors(getAssistantsAccountsProfiles).selectTotal;

export const getAssistantsAccountsCollection = adapter.getSelectors(getAssistantsAccountsProfiles).selectAll;
