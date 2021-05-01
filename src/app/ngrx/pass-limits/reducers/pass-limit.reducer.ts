import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {PassLimit} from '../../../models/PassLimit';
import {IPassLimitState} from '../states';
import {Action, createReducer, on} from '@ngrx/store';

import * as passLimitActions from '../actions';

export const adapter: EntityAdapter<PassLimit> = createEntityAdapter<PassLimit>();

export const passLimitsInitialState: IPassLimitState = adapter.getInitialState({
  loading: false,
  loaded: false
});

const reducer = createReducer(
  passLimitsInitialState,
  on(passLimitActions.getPassLimits, state => ({...state, loading: true, loaded: false})),
  on(passLimitActions.getPassLimitsSuccess, (state, {pass_limits}) => {
    return adapter.addAll(pass_limits, {...state, loading: false, loaded: true});
  }),
  on(passLimitActions.updatePassLimitSuccess, (state, {pass_limit}) => {
    let currentItem = {...state.entities[pass_limit.location_id]};
    currentItem = {
      id: currentItem.id,
      ...currentItem,
      from_count: pass_limit.passes_from,
      to_count: pass_limit.passes_to
    };
    return adapter.upsertOne(currentItem, {...state, loading: false, loaded: true});
  })
);

export function passLimitsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
