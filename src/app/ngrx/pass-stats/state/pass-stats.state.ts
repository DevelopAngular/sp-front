export interface PassStatsState {
  data: any;
  loading: boolean;
  loaded: boolean;
}

export const passStatsInitialState: PassStatsState = {
  data: {},
  loading: false,
  loaded: false
};
