import {Injectable} from '@angular/core';
import {HttpService} from './http-service';
import {PassLimit} from '../models/PassLimit';

@Injectable({
  providedIn: 'root'
})
export class TooltipDataService {

  constructor(private http: HttpService) { }

  reachedPassLimit(currentPage: 'from' | 'to', passLimit: PassLimit, isStaff?: boolean): boolean {
    if (!passLimit) {
      return false;
    }

    const { max_passes_to, max_passes_to_active, to_count } = passLimit;
    if (currentPage === 'to' && !isStaff) {
      if (!max_passes_to_active) { // room has no pass limits
        return false;
      }

      return to_count >= max_passes_to
    }

    return false;
  }

  tooltipDescription(currentPage: 'from' | 'to', passLimit: PassLimit): string {
    if ([!passLimit, currentPage === 'from',
      !this.http.getSchool().show_active_passes_number,
      !passLimit.max_passes_to_active,
      passLimit.to_count <= passLimit.max_passes_to].every(Boolean)
    ) {
      return '';
    }

    return `${passLimit.to_count}/${passLimit.max_passes_to} students have passes to this room.`;
  }
}
