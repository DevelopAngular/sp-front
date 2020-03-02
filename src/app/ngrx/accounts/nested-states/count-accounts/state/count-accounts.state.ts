import {TotalAccounts} from '../../../../../models/TotalAccounts';

export interface CountAccountsState {
  countData: TotalAccounts;
  loading: boolean;
  loaded: boolean;
}

export const countAccountsinitialState: CountAccountsState = {
  countData: {
    active_students: null,
    admin_count: null,
    alternative_count: null,
    assistant_count: null,
    gsuite_count: null,
    profile_count: null,
    student_count: null,
    teacher_count: null,
    total_count: null
  },
  loading: false,
  loaded: false
};

