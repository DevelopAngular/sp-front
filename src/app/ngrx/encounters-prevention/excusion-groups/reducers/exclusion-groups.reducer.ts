import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { ExclusionGroup } from '../../../../models/ExclusionGroup';
import { IExclusionGroupsState } from '../states';
import * as exclusionGroupsActions from '../actions';

export const adapter = createEntityAdapter<ExclusionGroup>();

const exclusionGroupsInitialState: IExclusionGroupsState = adapter.getInitialState({
	loading: false,
	loaded: false,
	currentExclusionGroupId: null,
	groupsForStudent: {},
});

const reducer = createReducer(
	exclusionGroupsInitialState,
	on(
		exclusionGroupsActions.getExclusionGroups,
		exclusionGroupsActions.getExclusionGroupsForStudent,
		exclusionGroupsActions.updateExclusionGroup,
		(state) => ({ ...state, loading: true, loaded: false })
	),
	on(exclusionGroupsActions.getExclusionGroupsSuccess, (state, { groups }) => {
		return adapter.addAll(groups, { ...state, loading: false, loaded: true });
	}),
	on(exclusionGroupsActions.createExclusionGroupSuccess, (state, { group }) => {
		return adapter.addOne(group, { ...state, loading: false, loaded: true, currentExclusionGroupId: group.id });
	}),
	on(exclusionGroupsActions.updateExclusionGroupSuccess, (state, { group }) => {
		return adapter.upsertOne(group, { ...state, currentExclusionGroupId: group.id, loaded: true, loading: false });
	}),
	on(exclusionGroupsActions.removeExclusionGroupSuccess, (state, { group }) => {
		return adapter.removeOne(group.id, { ...state, loading: false, loaded: true });
	}),
	on(exclusionGroupsActions.getExclusionGroupsForStudentSuccess, (state, { groups, studentId }) => {
		return { ...state, loading: false, loaded: true, groupsForStudent: { ...state.groupsForStudent, [studentId]: groups } };
	})
);

export function exclusionGroupsReducer(state: any | undefined, action: Action) {
	return reducer(state, action);
}
