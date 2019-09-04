import {AppState} from '../../app-state/app-state';
import {adapter} from '../reducers';


export const getLocationsState = (state: AppState) => state.locations;

export const getLocationsCollection = adapter.getSelectors(getLocationsState).selectAll;
