import {AppState} from '../../app-state/app-state';
import {colorAdapter} from '../reducers';
import {createSelector} from '@ngrx/store';
import {ColorsState} from './colors.state';


export const getColorsState = (state: AppState) => state.colorProfiles;

export const getColorProfilesCollection = colorAdapter.getSelectors(getColorsState).selectAll;

export const getLoadingColors = createSelector(
  getColorsState,
  (state: ColorsState) => state.loading
);

export const getLoadedColors = createSelector(
  getColorsState,
  (state: ColorsState) => state.loaded
);
