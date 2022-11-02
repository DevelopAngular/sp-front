import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import * as parentsActions from '../actions';
import {ParentsStates} from '../states';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const parentsAccountsInitialState: ParentsStates = adapter.getInitialState({
  loading: false,
  loaded: false,
  nextRequest: null,
  lastAddedParents: [],
  sortValue: '',
  addedUser: null,
  currentUpdatedAccount: null,
});

const reducer = createReducer(
  parentsAccountsInitialState,
  on(parentsActions.getParents,
      // parentsActions.removeparent,
    // parentsActions.getMoreparents,
      state => ({ ...state, loading: true, loaded: false, lastAddedParents: [] })),
  on(parentsActions.getParentsSuccess, (state, { parents, next }) => {
    return adapter.addAll(parents, { ...state, loading: false, loaded: true, nextRequest: next });
  }),
  on(parentsActions.removeParentSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  }),
  on(parentsActions.updateParentActivitySuccess,
    parentsActions.updateParentAccount,
    (state, {profile}) => {
    return adapter.upsertOne(profile, {...state, loading: false, loaded: true, currentUpdatedAccount: profile});
  }),
  on(parentsActions.getMoreParentSuccess, (state, {moreParents, next}) => {
    return adapter.addMany(moreParents, {...state, loading: false, loaded: true, nextRequest: next, lastAddedParents: moreParents});
  }),
  on(parentsActions.postParentSuccess, parentsActions.addUserToParentProfileSuccess, (state, {parent}) => {
    return adapter.addOne(parent, {...state, loading: false, loaded: true, addedUser: parent});
  }),
  on(parentsActions.getMoreParentsFailure, (state, {errorMessage}) => ({...state, loading: false, loaded: true})),
  on(parentsActions.bulkAddParentAccounts, (state, {parents}) => {
    return adapter.addMany(parents, {...state});
  }),
  on(parentsActions.sortParentAccounts, (state, {parents, next, sortValue}) => {
    return adapter.addAll(parents, {...state, loading: false, loaded: true, nextRequest: next, sortValue});
  }),
  on(parentsActions.clearCurrentUpdatedParent, (state) => ({...state, currentUpdatedAccount: null})),
  // on(parentsActions.getParentStats, (state) => ({...state, statsLoading: true, statsLoaded: false})),
  // on(parentsActions.getParentStatsSuccess, (state, {userId, stats}) => {
  //   return {...state, parentsStats: {...state.parentsStats, [userId]: stats}, statsLoading: false, statsLoaded: true};
  // }),
  // on(parentsActions.addReportToStatsSuccess, (state, {report}) => {
  //   return {...state, parentsStats: {...state.parentsStats, [report.parent.id]: {
  //     ...state.parentsStats[report.parent.id],
  //     reports: [report, ...state.parentsStats[report.parent.id].reports]
  //   }}};
  // })
);

export function parentsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}



