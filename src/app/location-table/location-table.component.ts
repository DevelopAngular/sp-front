import {Component, EventEmitter, Input, OnInit, Output, Directive, HostListener, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { HttpService } from '../services/http-service';
import { Location } from '../models/Location';
import {filter, map, pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {combineLatest, iif, Observable, of, Subject, zip} from 'rxjs';
import { sortBy, filter as _filter } from 'lodash';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {ScreenService} from '../services/screen.service';
import {HallPassesService} from '../services/hall-passes.service';
import {TooltipDataService} from '../services/tooltip-data.service';
import {PassLimit} from '../models/PassLimit';


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
  @Input() showStars: boolean;
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
  @Input() dummyString: string =  '';
  @Input() withMergedStars: boolean = true;
  @Input() searchExceptFavourites: boolean = false;
  @Input() allowOnStar: boolean = false;
  @Input() isFavoriteForm: boolean;
  @Input() originLocation: any;
  @Input() searchTeacherLocations: boolean;
  @Input() currentPage: 'from' | 'to';

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
  pinnables;
  pinnablesLoaded: boolean;

  passLimits: {[id: number]: PassLimit};

  showSpinner$: Observable<boolean>;
  loaded$: Observable<boolean>;

  isFocused: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private http: HttpService,
      private locationService: LocationsService,
      private pinnableService: HallPassesService,
      private shortcutsService: KeyboardShortcutsService,
      public screenService: ScreenService,
      public tooltipService: TooltipDataService
  ) {}

  ngOnInit() {
    this.pinnableService.loadedPinnables$.pipe(
      filter(res => res && !this.isFavoriteForm),
      switchMap(value => {
        return this.pinnableService.pinnables$;
      }),
      map(pins => {
        return pins.reduce((acc, pinnable) => {
          if (pinnable.category) {
            return { ...acc, [pinnable.category]: pinnable};
          } else if (pinnable.location) {
            return { ...acc, [pinnable.location.id]: pinnable };
          }
        }, {});
      }),
      takeUntil(this.destroy$)
    )
      .subscribe(res => {
        this.pinnables = res;
        this.pinnablesLoaded = true;
    });

    this.locationService.pass_limits_entities$
      .pipe(
        filter(() => !this.isFavoriteForm),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.passLimits = res;
    });

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
              .pipe(takeUntil(this.destroy$))
                .subscribe(res => {
                    this.choices = res;
                    this.noChoices = !this.choices.length;
                    this.mainContentVisibility = true;

                });
        } else if (this.forKioskMode) {
          const request$ = !!this.category ? this.locationService.getLocationsFromCategory(url, this.category) :
            this.locationService.getLocationsWithConfigRequest(url);

          request$.pipe(takeUntil(this.destroy$)).subscribe(res => {
              this.choices = res.filter(loc => !loc.restricted);
          });
        } else {
          const request$ = this.isFavoriteForm ? this.locationService.getLocationsWithConfigRequest(url).pipe(filter((res) => !!res.length)) :
            this.locationService.getLocationsFromCategory(url, this.category).pipe(filter((res) => !!res.length));

                request$.pipe(takeUntil(this.destroy$)).subscribe(p => {
                  this.choices = p;
                  this.noChoices = !this.choices.length;
                  this.pinnablesLoaded = true;
                  this.mainContentVisibility = true;
            });
        }

        this.isFocused = !this.isFavoriteForm && !(!this.forStaff && this.screenService.isDeviceLargeExtra);
    }
    if (this.type === 'location') {
      this.locationService.favoriteLocations$
        .pipe(takeUntil(this.destroy$))
        .subscribe((stars: any[]) => {
          this.pinnablesLoaded = true;
          this.starredChoices = this.kioskModeFilter(stars.map(val => Location.fromJSON(val)));
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

  normalizeLocations(loc) {
    if (this.currentPage !== 'from' && !this.isFavoriteForm) {
      if (loc.category) {
        if (!this.pinnables[loc.category] || !this.pinnables[loc.category].gradient_color) {
          loc.gradient = '#7f879d, #7f879d';
        } else {
          loc.gradient = this.pinnables[loc.category].gradient_color;
        }
      } else {
        if (!this.pinnables[loc.id] || !this.pinnables[loc.id].gradient_color) {
          loc.gradient = '#7f879d, #7f879d';
        } else {
          loc.gradient = this.pinnables[loc.id].gradient_color;
        }
      }
    }
      return loc;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateOrderLocation(locations) {
    const body = {'locations': locations.map(loc => loc.id)};
    this.locationService.updateFavoriteLocations(body).pipe(takeUntil(this.destroy$)).subscribe((res: number[]) => {
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
              return this.kioskModeFilter(locs);
            }),
            takeUntil(this.destroy$),
            switchMap(locs => {
              if (this.searchTeacherLocations) {
                return this.locationService.locations$.pipe(
                  map((locations) => {
                    const teachersRoom = locations.filter((location: Location) => {
                      return location.teachers.find(teacher => teacher.display_name.toLowerCase().includes(this.search));
                    });

                    // deduplicate rooms when searching
                    const locMap: { [id: string]: Location; } = {};
                    const outLocations: Location[] = [];
                    for (const obj of [...locs, ...teachersRoom]) {
                      if (typeof locMap[obj.id] === 'undefined') {
                        outLocations.push(obj);
                      }
                      locMap[obj.id] = obj;
                    }

                    return outLocations;
                  })
                );
              }
              return of(locs);
            })
          )
          .subscribe(p => {
            this.hideFavorites = true;
              const filtFevLoc = _filter(this.starredChoices, (item => {
                  return item.title.toLowerCase().includes(this.search);
              }));

            this.choices = (this.searchExceptFavourites && !this.forKioskMode) || !!this.category
                            ? [...this.filterResults(p)]
                            : [...filtFevLoc, ...this.filterResults(p)];
            this.noChoices = !this.choices.length;
          });
      } else {
        if (this.staticChoices && this.staticChoices.length) {
          this.choices = this.staticChoices;
        } else {
          iif(() => !!this.category, this.locationService.locsFromCategory$, this.locationService.locations$)
            .pipe(
              takeUntil(this.destroy$),
              map(locs => {
                return this.kioskModeFilter(locs);
            }))
            .subscribe(res => {
              this.choices = res;
              this.hideFavorites = false;
              this.noChoices = !this.choices.length;
          });

        }
      }

  }

  kioskModeFilter(locs: Location[]) {
    if (this.forKioskMode) {
      return locs.filter(loc => !loc.restricted);
    } else {
      return locs;
    }
  }


  isValidLocation(locationId: any) {
    if ((this.forStaff && (+locationId !== +this.invalidLocation)) || this.isFavoriteForm) {
      return true;
    }
    const location = this.passLimits[locationId];
    return location && (!this.forStaff && this.tooltipService.reachedPassLimit(this.currentPage, location, this.forStaff)) && (+location.id !== +this.invalidLocation);
  }

  mergeLocations(url, withStars: boolean, category: string) {
    const locsRequest$ = !!category ? this.locationService.getLocationsFromCategory(url, category) :
      this.locationService.getLocationsWithConfigRequest(url);
    return zip(
     locsRequest$,
     this.locationService.getFavoriteLocationsRequest()
    )
        .pipe(
          takeUntil(this.destroy$),
            map(([rooms, favorites]: [any, any[]]) => {
              if (withStars) {
                const locs = sortBy([...rooms, ...favorites], (item) => {
                  return item.title.toLowerCase();
                });
                return this.kioskModeFilter(locs);
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

  getDisabledTooltip(choice) {
    return this.originLocation && this.originLocation.id === choice.id;
  }

}
