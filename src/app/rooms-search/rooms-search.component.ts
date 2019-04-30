import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import { LocationsService } from '../services/locations.service';
import { DomSanitizer } from '@angular/platform-browser';
import {takeUntil} from "rxjs/internal/operators";
import {Subject} from "rxjs";

@Component({
  selector: 'app-rooms-search',
  templateUrl: './rooms-search.component.html',
  styleUrls: ['./rooms-search.component.scss']
})
export class RoomsSearchComponent implements OnInit, OnDestroy {

  @Input() width: string = '280px';
  @Input() placeholder: string;

  allRooms;

  destroy$ = new Subject();

  constructor(
      private locationService: LocationsService,
      private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.locationService.searchLocationsWithConfig('v1/locations?limit=1000&starred=false')
        .subscribe(res => {
          this.allRooms = res.results;
        });
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

    textColor(item) {
        if (item.hovered) {
            return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
        } else {
            return this.sanitizer.bypassSecurityTrustStyle('#555558');
        }
    }

    getBackground(item) {
        if (item.hovered) {
            if (item.pressed) {
                return '#E2E7F4';
            } else {
                return '#ECF1FF';
            }
        } else {
            return '#FFFFFF';
        }
    }

  onSearch(search) {

  }

}
