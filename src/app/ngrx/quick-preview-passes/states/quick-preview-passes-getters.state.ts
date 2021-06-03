import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IQuickPreviewPassesState} from './quick-preview-passes.state';

export const getQuickPreviewPassesState = (state: AppState) => state.quickPreviewPasses;


export const getQuickPreviewPassesLoading = createSelector(
  getQuickPreviewPassesState,
  (state: IQuickPreviewPassesState) => state.loading
);

export const getQuickPreviewPassesLoaded = createSelector(
  getQuickPreviewPassesState,
  (state: IQuickPreviewPassesState) => state.loaded
);

export const getQuickPreviewPassesCollection = createSelector(
  getQuickPreviewPassesState,
  (state: IQuickPreviewPassesState) => state.passes
);

export const getQuickPreviewPassesStats = createSelector(
  getQuickPreviewPassesState,
  (state: IQuickPreviewPassesState) => state.passesStats
);
