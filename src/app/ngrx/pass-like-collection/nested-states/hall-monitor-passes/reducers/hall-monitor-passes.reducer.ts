import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {HallPass} from '../../../../../models/HallPass';
import {IHallMonitorPassesState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';
import * as hallMonitorActions from '../actions';

export const adapter: EntityAdapter<HallPass> = createEntityAdapter<HallPass>();

export const hallMonitorPassesInitialState: IHallMonitorPassesState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  hallMonitorPassesInitialState,
  on(hallMonitorActions.getHallMonitorPasses,
    hallMonitorActions.updateHallMonitorPasses,
    (state) => ({...state, loading: true, loaded: false})),
  on(
    hallMonitorActions.getHallMonitorPassesSuccess,
    (state, {hallMonitorPasses}) => {
    return adapter.addAll(hallMonitorPasses, {...state, loading: false, loaded: true});
  })
);

export function hallMonitorPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
