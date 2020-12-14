import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IIntrosState} from './intros.state';

export const getIntrosState = (state: AppState) => state.intros;

export const getIntrosData = createSelector(
  getIntrosState,
  (state: IIntrosState) => state.data
);

export const getIntrosLoading = createSelector(
  getIntrosState,
  (state: IIntrosState) => state.loading
);

export const getIntrosLoaded = createSelector(
  getIntrosState,
  (state: IIntrosState) => state.loaded
);
