import {EntityState} from '@ngrx/entity';
import {Report} from '../../../models/Report';

export interface IGetReportsRequest extends EntityState<Report> {
  loading: boolean;
  loaded: boolean;
  reportsFound: Report[];
  addedReports: Report[];
}

