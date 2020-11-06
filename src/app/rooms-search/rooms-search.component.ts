import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {LocationsService} from '../services/locations.service';
import {Subject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {pluck, takeUntil} from 'rxjs/operators';
import {findIndex} from 'lodash';
import {Location} from '../models/Location';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-rooms-search',
  templateUrl: './rooms-search.component.html',
  styleUrls: ['./rooms-search.component.scss']
})
export class RoomsSearchComponent implements OnInit, OnDestroy {

  @Input() width: string = '280px';
  @Input() placeholder: string;
  @Input() roomsWithFolder;
  @Input() locations;

  @Output() result = new EventEmitter();

  @ViewChild('search', { static: false }) searchItem: ElementRef;

  allRooms: Location[];
  categories = [];

  searchResult: any[] = [];

  selectedRooms = [];
  selectedLocations: Location[] = [];

  showSearchResult: boolean;

  pending$: Subject<boolean> = new Subject();

  destroy$ = new Subject();

  constructor(
      private locationService: LocationsService,
      private sanitizer: DomSanitizer,
      private shortcutsService: KeyboardShortcutsService,
  ) { }

  ngOnInit() {
    this.locationService.getLocationsWithConfigRequest('v1/locations?limit=1000&starred=false')
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.allRooms = res;
        });

    this.locationService.getLocationsWithFolder()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
           this.categories = res.categories;
    });
    if (this.roomsWithFolder) {
        this.selectedRooms = this.roomsWithFolder;
    }
    if (this.locations) {
        this.selectedLocations = this.locations;
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        takeUntil(this.destroy$),
        pluck('key')
      ).subscribe(key => {
        if (key[0] === 'enter') {
          if (this.searchResult.length === 1) {
            (this.searchItem.nativeElement as HTMLElement).click();
          }
          const element = document.activeElement;
          (element as HTMLElement).click();
        }
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

  isSelected(room) {
      return findIndex(this.selectedRooms, (selectedRoom) => {
          return selectedRoom.title === room.title;
      }) > -1;
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

  selected(room, isCategory: boolean = false) {
      if (!this.isSelected(room)) {
          if (isCategory) {
              this.selectedRooms.push(room);
              this.selectedLocations.push(...room.locations);
          } else {
              this.selectedRooms.push(room);
              this.selectedLocations.push(room);
          }
          this.result.emit({ locations : this.selectedLocations, rooms: this.selectedRooms });
      } else {
          this.remove(room, isCategory);
      }
  }

  remove(room, isCategory: boolean) {
      this.selectedRooms = this.selectedRooms.filter(selRoom => selRoom.title !== room.title);
      this.selectedLocations = this.selectedLocations.filter((loc: any) => {
          if (isCategory) {
              return !room.locations.find(r => r.id === loc.id);
          } else {
              return loc.id !== room.id;
          }
      });
      this.result.emit({ locations: this.selectedLocations, rooms: this.selectedRooms });
  }

  onSearch(search) {
    this.pending$.next(true);
    if (!search) {
      this.showSearchResult = false;
      this.pending$.next(false);

    } else {
          this.locationService.searchLocations(100, `&search=${search}&starred=false`)
              .subscribe(res => {
                this.showSearchResult = true;
                this.searchResult = res.results;
                this.pending$.next(false);
              });
      }
  }

}
