import {Component, EventEmitter, Input, OnInit, Output, Directive, HostListener, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { HttpService } from '../services/http-service';
import { Location } from '../models/Location';
import {map, pluck, takeUntil} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {combineLatest, Observable, Subject, zip} from 'rxjs';
import { sortBy, filter as _filter } from 'lodash';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';


export interface Paged<T> {
  results: T[];
  next: string;
  previous: string;
}

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})

export class LocationTableComponent implements OnInit, OnDestroy {

  @Input() category: string;
  @Input() forKioskMode: boolean = false;
  @Input() placeholder: string;
  @Input() type: string;
  @Input() showStars: string;
  @Input() showFavorites: boolean;
  @Input() staticChoices: any[];
  @Input() forStaff: boolean;
  @Input() forLater: boolean;
  @Input() hasLocks: boolean;
  @Input() invalidLocation: string | number;
  @Input() noRightStar: boolean;
  @Input() height: string = '140px';
  @Input() heightLeftTable: string = '189px';
  @Input() inputWidth: string = '200px';
  @Input() isEdit: boolean = false;
  @Input() rightHeaderText: boolean = false;
  @Input() mergedAllRooms: boolean;
  @Input() dummyString: '';
  @Input() withMergedStars: boolean = true;
  @Input() searchExceptFavourites: boolean = false;
  @Input() allowOnStar: boolean = false;
  @Input() isFavoriteForm: boolean;
  @Input() originLocation: any;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<string> = new EventEmitter();
  @Output() onUpdate: EventEmitter<number[]> = new EventEmitter<number[]>();

  @ViewChild('item') currentItem: ElementRef;

  choices: any[] = [];
  noChoices:boolean = false;
  mainContentVisibility: boolean = false;
  starredChoices: any[] = [];
  search: string = '';
  favoritesLoaded: boolean;
  hideFavorites: boolean;

  showSpinner$: Observable<boolean>;
  loaded$: Observable<boolean>;

  isFocused: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private http: HttpService,
      private locationService: LocationsService,
      private shortcutsService: KeyboardShortcutsService
  ) {
  }

  ngOnInit() {
    this.showSpinner$ = combineLatest(
      this.locationService.loadingLocations$,
      this.locationService.loadingFavoriteLocations$,
      (loc, fav) => loc && fav
    );
    this.loaded$ = combineLatest(
      this.locationService.loadedLocations$,
      this.locationService.loadedFavoriteLocations$,
      (loc, fav) => loc && fav
    );

    if (!this.locationService.focused.value) {
      this.locationService.focused.next(true);
    }

    if (this.staticChoices && this.staticChoices.length) {
      this.choices = this.staticChoices;
      this.noChoices = !this.choices.length;
      this.mainContentVisibility = true;
    } else {
        const url = 'v1/'
            +(this.type==='teachers' ? 'users?role=_profile_teacher&' : 'locations?')
            +'limit=1000&'
            +((this.type==='location' && this.showFavorites)?'starred=false':'');
        if (this.mergedAllRooms)  {
            this.mergeLocations(url, this.withMergedStars, this.category)
                .subscribe(res => {
                    this.choices = res;
                    this.noChoices = !this.choices.length;
                    this.mainContentVisibility = true;

                });
        } else if (this.forKioskMode) {
            this.locationService.getLocationsWithConfigRequest(url)
                .subscribe(res => {
                    this.choices = res.filter(loc => !loc.restricted);
                });
        } else {
          const request$ = this.isFavoriteForm ? this.locationService.getLocationsWithConfigRequest(url) :
            this.locationService.getLocationsFromCategory(url, this.category);

                request$.subscribe(p => {
                  this.choices = p;
                  this.noChoices = !this.choices.length;
                  this.mainContentVisibility = true;
            });
        }

        this.isFocused = this.locationService.focused.value;
    }
    if (this.type === 'location') {
      this.locationService.favoriteLocations$.subscribe((stars: any[]) => {
        this.starredChoices = stars.map(val => Location.fromJSON(val));
        if (this.isFavoriteForm) {
            this.choices = [...this.starredChoices, ...this.choices].sort((a, b) => a.id - b.id);
        }
        if (this.forKioskMode) {
          this.choices = this.choices.filter(loc => !loc.restricted);
        }
          this.favoritesLoaded = true;
          this.mainContentVisibility = true;
      });
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroy$)
      )
      .subscribe(key => {
        if (key[0] === 'enter') {
          if (this.choices.length === 1) {
            const wrap = this.currentItem.nativeElement.querySelector('.wrapper');
            (wrap as HTMLElement).click();
          }
          const element = document.activeElement;
          (element as HTMLElement).click();
        }
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateOrderLocation(locations) {
    const body = {'locations': locations.map(loc => loc.id)};
    this.locationService.updateFavoriteLocations(body).subscribe((res: number[]) => {
      this.onUpdate.emit(res);
    });
  }


  onSearch(search: string) {
    this.search = search.toLowerCase();
      if (search !== '') {
        const url = 'v1/'
            +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
                +(!!this.category ? ('?category=' +this.category +'&') : '?')
            ))
            +'limit=100'
            +'&search=' +search
            +((this.type==='location' && this.showFavorites)?'&starred=false':'');

        this.locationService.searchLocationsRequest(url)
          .pipe(
            map((locs: any) => {
              if (this.forKioskMode) {
                return locs.filter(loc => !loc.restricted);
              } else {
                return locs;
              }
            })
          )
          .subscribe(p => {
            this.hideFavorites = true;
              const filtFevLoc = _filter(this.starredChoices, (item => {
                  return item.title.toLowerCase().includes(this.search);
              }));

            this.choices = this.searchExceptFavourites && !this.forKioskMode
                            ? [...this.filterResults(p)]
                            : [...filtFevLoc, ...this.filterResults(p)];
            this.noChoices = !this.choices.length;
          });
      } else {
        if (this.staticChoices && this.staticChoices.length) {
          this.choices = this.staticChoices;
        } else {
          this.locationService.locations$
            .pipe(map(locs => {
              if (this.forKioskMode) {
                return locs.filter(loc => !loc.restricted);
              } else {
                return locs;
              }
            }))
            .subscribe(res => {
            this.choices = res;
            this.hideFavorites = false;
            this.noChoices = !this.choices.length;
          });

        }
      }

  }


  isValidLocation(location) {
    if (!this.forStaff &&
      (!this.forLater &&
        location.request_mode === 'all_teachers_in_room' &&
        location.request_send_origin_teachers &&
        this.originLocation &&
        !this.originLocation.teachers.length) ||
      (this.forLater &&
        location.scheduling_request_mode === 'all_teachers_in_room' &&
        location.scheduling_request_send_origin_teachers &&
        this.originLocation &&
        !this.originLocation.teachers.length)
    ) {
      return false;
    }
    return !this.invalidLocation || +location.id !== +this.invalidLocation;
  }

  mergeLocations(url, withStars: boolean, category: string) {
    const locsRequest$ = !!category ? this.locationService.getLocationsFromCategory(url, category) :
      this.locationService.getLocationsWithConfigRequest(url);
    return zip(
     locsRequest$,
     this.locationService.getFavoriteLocationsRequest()
    )
        .pipe(
            map(([rooms, favorites]: [any, any[]]) => {
              if (withStars) {
                return sortBy([...rooms, ...favorites], (item) => {
                    return item.title.toLowerCase();
                });
              } else {
                return rooms;
              }
            }));
  }

  filterResults(results: any[]) {
    return results.filter(felement => {
      return this.starredChoices.findIndex((ielement) => {
        return ielement.id === felement.id;
      }) < 0;
    });
  }

  choiceSelected(choice: any) {
    this.locationService.focused.next(false);
    this.onSelect.emit(choice);
  }

  isSelected(choice) {
    return !!this.starredChoices.find(item => item.id === choice.id);
  }

  star(event) {
    if (!this.isEdit) {
      return this.choiceSelected(event);
    }
    if (event.starred) {
      this.addLoc(event, this.starredChoices);
    } else {
      this.removeLoc(event, this.starredChoices);
    }
    this.onSearch('');
    this.onStar.emit(event);
    this.search = '';
  }

  addLoc(loc: any, array: any[]) {
    if (!array.includes(loc)) {
      array.push(loc);
    }
  }

  removeLoc(loc: any, array: any[]) {
    const index = array.findIndex((element) => element.id === loc.id);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

}
