import {AppState} from '../../app-state/app-state';
import {createSelector} from '@ngrx/store';
import {IToastState} from './toast.state';

export const toastState = (state: AppState) => state.toast;

export const getIsOpenToast = createSelector(
  toastState,
  (state: IToastState) => state.isOpen
);

export const getDataToast = createSelector(
  toastState,
  (state: IToastState) => state.data
)
