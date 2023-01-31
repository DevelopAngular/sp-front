import { AppState } from '../../app-state/app-state';
import { adapter } from '../reducers';

export const getPassLimitState = (state: AppState) => state.pass_limits;

export const getPassLimitEntities = adapter.getSelectors(getPassLimitState).selectEntities;

export const getPassLimitCollection = adapter.getSelectors(getPassLimitState).selectAll;
