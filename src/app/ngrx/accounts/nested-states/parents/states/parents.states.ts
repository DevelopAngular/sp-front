import { EntityState } from '@ngrx/entity';
import { User } from '../../../../../models/User';
// import {UserStats} from '../../../../../models/UserStats';

export interface ParentsStates extends EntityState<User> {
	loading: boolean;
	loaded: boolean;
	lastAddedParents: User[];
	nextRequest: string;
	sortValue: string;
	addedUser: User;
	currentUpdatedAccount: User;
}
