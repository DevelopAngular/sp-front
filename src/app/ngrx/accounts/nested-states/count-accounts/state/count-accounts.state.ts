import {TotalAccounts} from '../../../../../models/TotalAccounts';

export interface CountAccountsState {
  countData: TotalAccounts;
  loading: boolean;
  loaded: boolean;
}

export const countAccountsinitialState: CountAccountsState = {
  countData: {
    active_students: '-',
    admin_count: '-',
    alternative_count: '-',
    assistant_count: '-',
    gsuite_count: '-',
    profile_count: '-',
    student_count: '-',
    teacher_count: '-',
    total_count: '-'
  },
  loading: false,
  loaded: false
};

