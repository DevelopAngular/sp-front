import {ContactTrace} from '../../../models/ContactTrace';

export interface IContactTraceStates {
  data: ContactTrace[];
  loading: boolean;
  loaded: boolean;
}
