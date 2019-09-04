import {AllAccountsState} from '../nested-states/all-accounts/states';
import {AdminsState} from '../nested-states/admins/states/admins.state';
import {TeachersStates} from '../nested-states/teachers/states';
import {AssistantsStates} from '../nested-states/assistants/states';
import {StudentsStates} from '../nested-states/students/states';
import {CountAccountsState} from '../nested-states/count-accounts/state';

export interface RoleProps {
  role: string;
  search: string;
  limit: number;
}

export interface PostRoleProps {
  school_id: string | number;
  user: any;
  userType: string;
  roles: string[];
}

export interface IAccountsState {
  allAccounts?: AllAccountsState;
  adminsAccounts?: AdminsState;
  teachersAccounts?: TeachersStates;
  assistantsAccounts?: AssistantsStates;
  studentsAccounts?: StudentsStates;
  countAccounts?: CountAccountsState;
}

export const accountsInitialState: IAccountsState = {};
