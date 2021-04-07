import {Action, createReducer, on} from '@ngrx/store';
import {IQuickPreviewPassesState} from '../states';
import * as previewPassesActions from '../actions';

const previewPassesInitialState: IQuickPreviewPassesState = {
  loading: false,
  loaded: false,
  passesStats: {
    past_passes_month: null,
    past_passes_today: null,
    past_passes_week: null
  },
  passes: []
};

const reducer = createReducer(
  previewPassesInitialState,
  on(previewPassesActions.getPreviewPasses, state => ({...state, loading: true, loaded: false})),
  on(previewPassesActions.getPreviewPassesSuccess, (state, {previewPasses}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      passesStats: {
        past_passes_month: previewPasses.past_passes_month,
        past_passes_today: previewPasses.past_passes_today,
        past_passes_week: previewPasses.past_passes_week
      },
      passes: previewPasses.recent_past_passes
    };
  })
);

export function quickPreviewPassesReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
