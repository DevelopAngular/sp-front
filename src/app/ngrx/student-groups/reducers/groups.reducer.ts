import {Action, createReducer, on} from '@ngrx/store';
import {GroupsStates} from '../states';
import * as groupsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {StudentList} from '../../../models/StudentList';

export const groupsAdapter: EntityAdapter<StudentList> = createEntityAdapter<StudentList>();

export const groupsInitialState: GroupsStates = groupsAdapter.getInitialState({
  loading: false,
  loaded: false,
  currentGroupId: null
});

const reducer = createReducer(
  groupsInitialState,
  on(groupsActions.getStudentGroups, state => ({...state, loading: true, loaded: false})),
  on(groupsActions.getStudentGroupsSuccess, (state, {groups}) => {
    return groupsAdapter.addAll(groups, {...state, loading: false, loaded: true});
  }),
  on(groupsActions.updateStudentGroupSuccess, (state, {group}) => {
    return groupsAdapter.upsertOne(group, {...state, loading: false, loaded: true});
  }),
  on(groupsActions.removeStudentGroupSuccess, (state, {id}) => {
    return groupsAdapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
  // on(groupsActions.postStudentGroupSuccess, (state, {group}) => {
  //    return groupsAdapter.addOne(group, {...state, loading: false, loaded: true});
  // })
);

export function studentGroupsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
