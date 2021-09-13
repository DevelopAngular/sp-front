import { AppState } from '../../app-state/app-state';
import { createSelector } from '@ngrx/store';
import { ILoginDataState } from './login-data.state';

export const getLoginDataState = (state: AppState) => state.loginData;

export const getLoginDataQueryParams = createSelector(
  getLoginDataState,
  (state: ILoginDataState) => state.queryParams
);
