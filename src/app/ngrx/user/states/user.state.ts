import { User } from '../../../models/User';

export interface UserState {
	user: User;
	userPin: string | number;
	loading: boolean;
	loaded: boolean;
	nuxDates: any;
	currentUpdatedUser: User;
}
