import {HallPass} from './HallPass';

export interface QuickPreviewPasses {
  past_passes_month: number;
  past_passes_today: number;
  past_passes_week: number;
  recent_past_passes: HallPass[];
}
