import {Injectable} from '@angular/core';
import {HttpService} from './http-service';
import {PassLimit} from '../models/PassLimit';

@Injectable({
  providedIn: 'root'
})
export class TooltipDataService {

  constructor(private http: HttpService) { }

  reachedPassLimit(currentPage: 'from' | 'to', passLimit: PassLimit, isStaff?: boolean): boolean {
    // TODO uncomment when branch SP-1050 is available
    // if (currentPage === 'from' && passLimit.max_passes_from_active && ((passLimit.from_count && passLimit.from_count >= passLimit.max_passes_from) || (!passLimit.from_count && !passLimit.max_passes_from))) {
    //   return false;
    // } else
      if (currentPage === 'to' && passLimit.max_passes_to_active && ((passLimit.to_count && passLimit.to_count >= passLimit.max_passes_to) || (!passLimit.to_count && !passLimit.max_passes_to)) && !isStaff) {
      return false;
    }
    return true;
  }

  tooltipDescription(currentPage: 'from' | 'to', passLimit: PassLimit): string {
    // TODO uncomment when branch SP-1050 is available
    // if (currentPage === 'from') {
    //   if (this.http.getSchool().show_active_passes_number) {
    //     if (passLimit.max_passes_from_active) {
    //       if (passLimit.from_count <= passLimit.max_passes_from) {
    //         return `${passLimit.from_count}/${passLimit.max_passes_from} students have passes from this room. ` + (passLimit.from_count === passLimit.max_passes_from ? `Wait for a spot to open` : ``);
    //       }
    //     } else {
    //       return `${passLimit.from_count} students have passes from this room.`;
    //     }
    //   }
    // } else
      if (currentPage === 'to') {
      if (this.http.getSchool().show_active_passes_number) {
        if (passLimit.max_passes_to_active) {
          if (passLimit.to_count <= passLimit.max_passes_to) {
            return `${passLimit.to_count}/${passLimit.max_passes_to} students have passes to this room. ` + (passLimit.to_count === passLimit.max_passes_to ? `Wait for a spot to open` : ``);
          }
        } else {
          return `${passLimit.to_count} students have passes to this room.`;
        }
      }
    }
    return 'Limit reached. Please wait for a spot to open.';
  }
}
