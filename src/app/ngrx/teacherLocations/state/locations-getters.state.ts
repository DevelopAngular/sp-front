import { AppState } from '../../app-state/app-state';
import { adapter } from '../reducers';


export const getTeacherLocationsState = (state: AppState) => state.teacherLocations;

export const getTeacherLocationsCollection = adapter.getSelectors(getTeacherLocationsState).selectAll;
