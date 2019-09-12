import {AppState} from '../../app-state/app-state';
import {adapter} from '../reducers';


export const getLocationsState = (state: AppState) => state.teacherLocations;

export const getLocationsCollection = adapter.getSelectors(getLocationsState).selectAll;
