import {reportsReducer} from '../reports/reducers';
import {pinnablesReducer} from '../pinnables/reducers';
import {accountsReducer} from '../accounts/reducers';
import {dashboardDataReducer} from '../dashboard/reducers';
import {passStatsReducer} from '../pass-stats/reducers';
import {studentGroupsReducer} from '../student-groups/reducers';
import {teacherLocationsReducer} from '../teacherLocations/reducers';
import {locationsReducer} from '../locations/reducers';
import {favoriteLocationsReducer} from '../favorite-locations/reducers';
import {colorsReducer} from '../color-profiles/reducers';
import {schoolsReducer} from '../schools/reducers';
import {userReducer} from '../user/reducers/user.reducer';
import {onboardProcessReducer} from '../onboard-process/reducers/process.reducer';
import {passLimitsReducer} from '../pass-limits/reducers';
import {passesReducer} from '../passes/reducers/passes.reducer';
import {contactTraceReducer} from '../contact-trace/reducers';
import {toastReducer} from '../toast/reducers';
import {IntrosReducer} from '../intros/reducers';


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
  readonly onboardProcess;
  readonly pass_limits;
  readonly passes;
  readonly contactTrace;
  readonly toast;
  readonly intros;
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
  user: userReducer,
  onboardProcess: onboardProcessReducer,
  pass_limits: passLimitsReducer,
  passes: passesReducer,
  contactTrace: contactTraceReducer,
  toast: toastReducer,
  intros: IntrosReducer
};
