import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IToastState} from './toast.state';
import {adapter} from '../reducers';

export const toastState = (state: AppState) => state.toast;

export const getToastsCollection = adapter.getSelectors(toastState).selectAll;
export const getOpenedToastsEntities = adapter.getSelectors(toastState).selectEntities;

export const getOpenedToasts = createSelector(
  getToastsCollection,
  (state) => state.reverse()
);

export const getLastOpenedToastId = createSelector(
  toastState,
  (state: IToastState) => state.currentToastId
);

export const getCurrentToast = createSelector(
  getLastOpenedToastId,
  getOpenedToastsEntities,
  (id, entities) => entities[id]
);

export const getIsOpenToast = createSelector(
  getCurrentToast,
  (state) => state && state.isOpen
);

export const getDataToast = createSelector(
  getCurrentToast,
  (state) => state ? state.data : null
);
