import {Action, createReducer, on} from '@ngrx/store';
import {IGetReportsRequest} from '../states';
import * as reportsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Report} from '../../../models/Report';

export const adapter: EntityAdapter<Report> = createEntityAdapter<Report>();

export const reportsInitialState: IGetReportsRequest = adapter.getInitialState({
  loading: false,
  loaded: false,
  reportsFound: [],
  addedReports: []
});

const reducer = createReducer(
  reportsInitialState,
  on(
    reportsActions.getReports,
    reportsActions.searchReports,
    reportsActions.postReport,
      state => ({ ...state, loading: true, loaded: false })),
  on(reportsActions.getReportsSuccess, (state, { reports }) => {
    return adapter.addAll(reports, {...state, loading: false, loaded: true});
  }),
  on(reportsActions.searchReportsSuccess, (state, {reports}) => {
    return {
      ...state,
      loading: false,
      loaded: true,
      reportsFound: reports
    };
  }),
  on(reportsActions.postReportSuccess, (state, {reports}) => {
    return adapter.addMany(reports, {...state, loading: false, loaded: true, addedReports: reports});
  })
);

export function reportsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
