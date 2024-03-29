import { AllAccountsState } from '../nested-states/all-accounts/states';
import { AdminsState } from '../nested-states/admins/states/admins.state';
import { TeachersStates } from '../nested-states/teachers/states';
import { AssistantsStates } from '../nested-states/assistants/states';
import { StudentsStates } from '../nested-states/students/states';
import { CountAccountsState } from '../nested-states/count-accounts/state';
import { User } from '../../../models/User';
import { ParentsStates } from '../nested-states/parents/states';

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
	role?: string;
	behalf?: User[];
}

export interface IAccountsState {
	allAccounts?: AllAccountsState;
	adminsAccounts?: AdminsState;
	teachersAccounts?: TeachersStates;
	assistantsAccounts?: AssistantsStates;
	studentsAccounts?: StudentsStates;
	parentsAccounts?: ParentsStates;
	countAccounts?: CountAccountsState;
}

export const accountsInitialState: IAccountsState = {};
