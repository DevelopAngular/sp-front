export interface DashboardState {
  data: any;
  loading: boolean;
  loaded: boolean;
}

export const dashboardDataInitialState: DashboardState = {
  data: null,
  loading: false,
  loaded: false
};
