import {PassLikeProvider} from '../providers';

export interface CollectionRestriction {
  mock?: boolean;
  displayState?: string;
  title?: string;
  icon?: string;
  emptyMessage?: string;
  columns?: number;
  fromPast?: boolean;
  forFuture?: boolean;
  isActive?: boolean;
  forStaff?: boolean;
  forMonitor?: boolean;
  hasSort?: boolean;
  maxHeight?: string;
  showEmptyHeader?: boolean;
  columnViewIcon?: boolean;
  smoothlyUpdating?: boolean;
}
