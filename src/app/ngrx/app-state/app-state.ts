import { reportsReducer } from '../reports/reducers';
import { pinnablesReducer } from '../pinnables/reducers';
import { accountsReducer } from '../accounts/reducers';
import { locationsReducer } from '../locations/reducers';
import { dashboardDataReducer } from '../dashboard/reducers';
import { passStatsReducer } from '../pass-stats/reducers';
import { studentGroupsReducer } from '../student-groups/reducers';


export interface AppState {
  readonly reports;
  readonly pinnables;
  readonly accounts;
  readonly locations;
  readonly dashboard;
  readonly passStats;
  readonly studentGroups;
}

export const reducers = {
  reports: reportsReducer,
  pinnables: pinnablesReducer,
  accounts: accountsReducer,
  locations: locationsReducer,
  dashboard: dashboardDataReducer,
  passStats: passStatsReducer,
  studentGroups: studentGroupsReducer
};
