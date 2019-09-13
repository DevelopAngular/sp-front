import { AppState } from '../../app-state/app-state';
import {schoolAdapter} from '../reducers';

export const getSchoolsState = (state: AppState) => state.schools;

export const getSchoolsCollection = schoolAdapter.getSelectors(getSchoolsState).selectAll;
