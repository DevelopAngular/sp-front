import { Action, createReducer, on } from '@ngrx/store';
import { TeachersStates } from '../states';
import * as teachersActions from '../actions';
import { addUserToTeacherProfileSuccess } from '../actions';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { User } from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const teachersInitialState: TeachersStates = adapter.getInitialState({
	loading: false,
	loaded: false,
	nextRequest: null,
	lastAddedTeachers: [],
	sortValue: '',
	addedUser: null,
	currentUpdatedAccount: null,
});

const reducer = createReducer(
	teachersInitialState,
	on(
		teachersActions.getTeachers,
		// teachersActions.removeTeacher,
		// teachersActions.getMoreTeachers,
		(state) => ({ ...state, loading: true, loaded: false })
	),
	on(teachersActions.getTeachersSuccess, (state, { teachers, next }) => {
		return adapter.addAll(teachers, { ...state, loading: false, loaded: true, nextRequest: next, lastAddedTeachers: [] });
	}),
	on(teachersActions.removeTeacherSuccess, (state, { id }) => {
		return adapter.removeOne(+id, { ...state, loading: false, loaded: true });
	}),
	on(
		teachersActions.updateTeacherActivitySuccess,
		teachersActions.updateTeacherPermissionsSuccess,
		teachersActions.updateTeacherAccount,
		teachersActions.updateTeacherLocationsSuccess,
		(state, { profile }) => {
			return adapter.upsertOne(profile, { ...state, loading: false, loaded: true, currentUpdatedAccount: profile });
		}
	),
	on(teachersActions.getMoreTeachersSuccess, (state, { moreTeachers, next }) => {
		return adapter.addMany(moreTeachers, { ...state, loading: false, loaded: true, nextRequest: next, lastAddedTeachers: moreTeachers });
	}),
	on(teachersActions.postTeacherSuccess, addUserToTeacherProfileSuccess, (state, { teacher }) => {
		return adapter.addOne(teacher, { ...state, loading: false, loaded: true, addedUser: teacher });
	}),
	on(teachersActions.getMoreTeachersFailure, (state, { errorMessage }) => ({ ...state, loading: false, loaded: true })),
	on(teachersActions.bulkAddTeacherAccounts, (state, { teachers }) => {
		return adapter.addMany(teachers, { ...state });
	}),
	on(teachersActions.sortTeacherAccountsSuccess, (state, { teachers, next, sortValue }) => {
		return adapter.addAll(teachers, { ...state, loading: false, loaded: true, nextRequest: next, sortValue });
	}),
	on(teachersActions.clearCurrentUpdatedTeacher, (state) => ({ ...state, currentUpdatedAccount: null }))
);

export function teachersReducer(state: any | undefined, action: Action) {
	return reducer(state, action);
}
