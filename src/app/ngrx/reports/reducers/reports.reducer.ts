import {Action, createReducer, on} from '@ngrx/store';
import {reportsInitialState} from '../states';
import * as reportsActions from '../actions';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {Report} from '../../../models/Report';

export const adapter: EntityAdapter<Report> = createEntityAdapter<Report>();

const reducer = createReducer(
  reportsInitialState,
  on(reportsActions.getReports, reportsActions.searchReports, state => ({ ...state, loading: true, loaded: false })),
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
  })
);

export function reportsReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
