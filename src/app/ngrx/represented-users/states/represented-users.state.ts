import {RepresentedUser} from '../../../navbar/navbar.component';

export interface IRepresentedUsersState {
  loading: boolean;
  loaded: boolean;
  rUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;
}
