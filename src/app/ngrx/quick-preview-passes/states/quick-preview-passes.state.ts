import {HallPass} from '../../../models/HallPass';

export interface IQuickPreviewPassesState {
  loading: boolean;
  loaded: boolean;
  passesStats: {
    past_passes_month: number,
    past_passes_today: number,
    past_passes_week: number,
  };
  passes: HallPass[];
}
