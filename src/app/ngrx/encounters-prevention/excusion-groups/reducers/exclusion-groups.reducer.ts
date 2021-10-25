import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import {IExclusionGroupsState} from '../states';
import * as exclusionGroupsActions from '../actions';

export const adapter = createEntityAdapter<ExclusionGroup>();

const exclusionGroupsInitialState: IExclusionGroupsState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  exclusionGroupsInitialState,
  on(exclusionGroupsActions.getExclusionGroups, state => ({ ...state, loading: true, loaded: false })),
  on(exclusionGroupsActions.getExclusionGroupsSuccess, (state, {groups}) => {
    return adapter.addAll(groups, { ...state, loading: false, loaded: true });
  })
);

export function exclusionGroupsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
