import {EntityState} from '@ngrx/entity';
import {Report} from '../../../models/Report';

export interface IGetReportsRequest extends EntityState<Report> {
  loading: boolean;
  loaded: boolean;
  reportsFound: Report[];
}

export const reportsInitialState: IGetReportsRequest = {
  ids: [],
  entities: {},
  loading: false,
  loaded: false,
  reportsFound: []
};
