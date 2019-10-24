import {allAccountsReducer} from '../nested-states/all-accounts/reducers';
import {accountsInitialState, IAccountsState} from '../states';
import {adminsReducer} from '../nested-states/admins/reducers';
import {teachersReducer} from '../nested-states/teachers/reducers';
import {assistantsReducer} from '../nested-states/assistants/reducers';
import {studentsReducer} from '../nested-states/students/reducers';
import {countAccountsReducer} from '../nested-states/count-accounts/reducers';



export function accountsReducer(
  state = accountsInitialState,
  action
): IAccountsState {
  return {
    allAccounts: allAccountsReducer(state.allAccounts, action),
    adminsAccounts: adminsReducer(state.adminsAccounts, action),
    teachersAccounts: teachersReducer(state.teachersAccounts, action),
    assistantsAccounts: assistantsReducer(state.assistantsAccounts, action),
    studentsAccounts: studentsReducer(state.studentsAccounts, action),
    countAccounts: countAccountsReducer(state.countAccounts, action)
  };
}
