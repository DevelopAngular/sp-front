import { reportsReducer } from '../reports/reducers';
import { pinnablesReducer } from '../pinnables/reducers';
import { accountsReducer } from '../accounts/reducers';
import { dashboardDataReducer } from '../dashboard/reducers';
import { passStatsReducer } from '../pass-stats/reducers';
import { studentGroupsReducer } from '../student-groups/reducers';
import { teacherLocationsReducer } from '../teacherLocations/reducers';
import { locationsReducer } from '../locations/reducers';
import { favoriteLocationsReducer } from '../favorite-locations/reducers';
import { colorsReducer } from '../color-profiles/reducers';
import { schoolsReducer } from '../schools/reducers';
import { userReducer } from '../user/reducers/user.reducer';


export interface AppState {
  readonly reports;
  readonly pinnables;
  readonly accounts;
  readonly locations;
  readonly favoriteLocations;
  readonly teacherLocations;
  readonly dashboard;
  readonly passStats;
  readonly studentGroups;
  readonly colorProfiles;
  readonly schools;
  readonly user;
}

export const reducers = {
  reports: reportsReducer,
  pinnables: pinnablesReducer,
  accounts: accountsReducer,
  locations: locationsReducer,
  favoriteLocations: favoriteLocationsReducer,
  teacherLocations: teacherLocationsReducer,
  dashboard: dashboardDataReducer,
  passStats: passStatsReducer,
  studentGroups: studentGroupsReducer,
  colorProfiles: colorsReducer,
  schools: schoolsReducer,
  user: userReducer
};
