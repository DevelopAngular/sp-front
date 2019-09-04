import {Action, createReducer, on} from '@ngrx/store';
import {assistantsInitialState} from '../states';
import * as assistantsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {User} from '../../../../../models/User';

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const reducer = createReducer(
  assistantsInitialState,
  on(assistantsActions.getAssistants,
      assistantsActions.removeAssistant,
      state => ({...state, loading: true, loaded: false })),
  on(assistantsActions.getAssistantsSuccess, (state, {assistants}) => {
    return adapter.addAll(assistants, {...state, loading: false, loaded: true });
  }),
  on(assistantsActions.removeAssistantSuccess, (state, {id}) => {
    return adapter.removeOne(+id, {...state, loading: false, loaded: true});
  })
);

export function assistantsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
