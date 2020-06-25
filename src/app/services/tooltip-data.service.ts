import { Injectable } from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class TooltipDataService {

  constructor(private http: HttpService) { }

  reachedPassLimit(currentPage: 'from' | 'to', location: Location): boolean {
    if (currentPage === 'from' && location.max_passes_from_active && location.current_active_pass_count_as_origin && location.current_active_pass_count_as_origin <= location.max_passes_from) {
      return false;
    } else if (currentPage === 'to' && location.max_passes_to_active && location.current_active_pass_count_as_destination && location.current_active_pass_count_as_destination <= location.max_passes_to) {
      return false;
    }
    return true;
  }

  tooltipDescription(currentPage: 'from' | 'to', location: Location): string {
    if (currentPage === 'from') {
      if (this.http.getSchool().show_active_passes_number) {
        if (location.max_passes_from_active) {
          if (location.current_active_pass_count_as_origin && location.current_active_pass_count_as_origin <= location.max_passes_from) {
            return `${location.current_active_pass_count_as_origin}/${location.max_passes_from} students have passes from this room. Wait for a spot to open`;
          }
        }
      } else {
        if (location.max_passes_from_active) {
          return `${location.current_active_pass_count_as_origin} students have passes from this room`;
        }
      }
    } else if (currentPage === 'to') {
      if (this.http.getSchool().show_active_passes_number) {
        if (location.max_passes_to_active) {
          if (location.current_active_pass_count_as_destination && location.current_active_pass_count_as_destination <= location.max_passes_to) {
            return `${location.current_active_pass_count_as_destination}/${location.max_passes_to} students have passes to this room. Wait for a spot to open`;
          }
        } else {
          return `${location.current_active_pass_count_as_destination} students have passes from this room`;
        }
      }
    }
    return `Limit reached. Please wait for a spot to open.`;
  }
}
