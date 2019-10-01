
export interface CountAccountsState {
  countData: {
    admin_count?: number;
    alternative_count?: number;
    assistant_count?: number;
    gsuite_count?: number;
    profile_count?: number;
    student_count?: number;
    teacher_count?: number;
    total_count?: number;
  };
  loading: boolean;
  loaded: boolean;
}

export const countAccountsinitialState: CountAccountsState = {
  countData: {
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

