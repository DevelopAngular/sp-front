import {EntityState} from '@ngrx/entity';
import {Request} from '../../../../../models/Request';

export interface IRequestsState extends EntityState<Request> {
  loading: boolean;
  loaded: boolean;
}
