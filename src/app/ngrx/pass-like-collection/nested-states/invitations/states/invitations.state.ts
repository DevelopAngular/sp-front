import {EntityState} from '@ngrx/entity';
import {Invitation} from '../../../../../models/Invitation';

export interface IInvitationsState extends EntityState<Invitation> {
  loading: boolean;
  loaded: boolean;
}
