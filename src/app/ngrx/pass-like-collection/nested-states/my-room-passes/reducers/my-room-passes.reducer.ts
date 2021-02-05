import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IMyRoomPassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as myRoomPassesActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const myRoomPassesInitialState: IMyRoomPassesState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  myRoomPassesInitialState,
  on(myRoomPassesActions.getMyRoomPasses, (state) => ({...state, loading: true, loaded: false})),
  on(myRoomPassesActions.getMyRoomPassesSuccess, (state, {myRoomPasses}) => {
    return adapter.addAll(myRoomPasses, {...state, loading: false, loaded: true});
  })
);

export function myRoomPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
