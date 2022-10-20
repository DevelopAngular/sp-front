import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, Injector} from '@angular/core';
import {HttpService} from '../services/http-service';
import {Location} from '../models/Location';
import {filter, map, pluck, switchMap, takeUntil, take, skip} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {combineLatest, iif, Observable, of, Subject, zip} from 'rxjs';
import {filter as _filter, sortBy} from 'lodash';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {ScreenService} from '../services/screen.service';
import {HallPassesService} from '../services/hall-passes.service';
import {TooltipDataService} from '../services/tooltip-data.service';
import {PassLimit} from '../models/PassLimit';
import {DeviceDetection} from '../device-detection.helper';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LocationVisibilityService} from '../create-hallpass-forms/main-hallpass--form/location-visibility.service';
import {UserService} from '../services/user.service';
import {User} from '../models/User';
import {PassLimitInfo} from '../models/HallPassLimits';
import {cloneDeep} from 'lodash';
import {MainHallPassFormComponent} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';


export interface Paged<T> {
  results: T[];
  next: string;
  previous: string;
}

// TODO: it does wipe out any existent get set
function Visibility(): any {
  return function (target: any, property: string, descriptor: PropertyDescriptor) {
    let values: any[];

    return {
      set: function (vv: any[]) {
        // accessing mainParent component indicates that FORM_STATE should be a service
        // usually we get FORM_STATE in a cascading fashion 
        // from parent to child more then 1 level deep 
        const mainParent = this._injector.get(MainHallPassFormComponent);
        const stateData = mainParent.FORM_STATE.data;

        const isDedicatedUser = this.forKioskMode && (
          (!!this.user?.isKioskDedicatedUser() ||
          stateData?.kioskModeStudent instanceof User)
        );

        // kiosk mode can be enterd in 2 ways: 
        // by a teacher - isStaff
        // by a dedicated user - isDedicatedUser
        const isStaffUser = (!!this.forStaff && this.forKioskMode);
        const isChooseSelectedStudent = (isStaffUser || isDedicatedUser);

        // usually the real student is represented by this.user
        // but for the kiosk mode case this.user represents the account that started the kiosk mode
        // a teacher or a dedicated user
        // so we need to take the student from this.selectedStudents
        const student = [this.user];
        if (isChooseSelectedStudent) { 
          student[0] = this.selectedStudents[0] ?? stateData.kioskModeStudent;
        }
        // filtering apply only for a student
        if (vv.length > 0 &&
          ( // is student
            !this.forStaff || 
            // is staff
            isStaffUser
          )
         ) {
          // test if we have Location's
          let v = vv[0];
          try {
            v = (v instanceof Location) ? v : Location.fromJSON(v);
            vv = vv.filter((loc: Location) => this.visibilityService.filterByVisibility(loc, student));
          } catch (e) {}
        }
        values = vv;
      },
      get: function() {
        return values;
      },
      enumerable: true,
      configurable: true
    };
  };
}

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})

export class LocationTableComponent implements OnInit, OnDestroy {

  @Input() category: string;
  @Input() forKioskMode = false;
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
  @Input() updatedLocation$?: Observable<Location> | undefined;
  @Input() selectedStudents: User[] = [];
  @Input() passLimitInfo: PassLimitInfo;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<string> = new EventEmitter();
  @Output() onUpdate: EventEmitter<Location[]> = new EventEmitter<Location[]>();

  @ViewChild('item') currentItem: ElementRef;

  @Visibility()
  choices: any[] = [];
  noChoices:boolean = false;
  mainContentVisibility: boolean = false;
  @Visibility()
  starredChoices: any[] = [];
  search: string = '';
  favoritesLoaded: boolean;
  hideFavorites: boolean;
  pinnables;
  pinnablesLoaded: boolean;

  passLimits: {[id: number]: PassLimit} = {};

  private user: User;

  showSpinner$: Observable<boolean>;
  loaded$: Observable<boolean>;
  loading$: Observable<boolean>;

  isFocused: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private http: HttpService,
      private locationService: LocationsService,
      private pinnableService: HallPassesService,
      private shortcutsService: KeyboardShortcutsService,
      public screenService: ScreenService,
      public tooltipService: TooltipDataService,
      private userService: UserService,
      private visibilityService: LocationVisibilityService,
      private _injector: Injector,
  ) {}

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  ngOnInit() {
    this.userService.user$
    .pipe(
      takeUntil(this.destroy$),
      filter(u => !!u),
      take(1),
    )
    .subscribe((u: User) => this.user = u);

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

    this.loading$ = this.locationService.loadingLocations$;

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
                  // debugger;
                    this.choices = res;
                    this.noChoices = !this.choices.length;
                    this.mainContentVisibility = true;

                });
        } else if (this.forKioskMode) {
          const request$ = !!this.category ? this.locationService.getLocationsFromCategory(url, this.category) :
            this.locationService.getLocationsWithConfigRequest(url);

          request$.pipe(takeUntil(this.destroy$)).subscribe(res => {
              this.choices = res.map(loc => {
                loc.restricted = loc.restricted || this.passLimitInfo?.current === 0;
                return loc;
              });
          });
        } else {
          const request$ = this.isFavoriteForm ? this.locationService.getLocationsWithConfigRequest(url).pipe(filter((res) => !!res.length)) :
            this.locationService.getLocationsFromCategory(url, this.category).pipe(filter((res) => !!res.length));

                request$.pipe(takeUntil(this.destroy$)).subscribe(p => {
                  this.choices = p.map(loc => {
                    loc.restricted = loc.restricted || this.passLimitInfo?.current === 0;
                    return loc;
                  });
                  this.noChoices = !this.choices.length;
                  this.pinnablesLoaded = true;
                  this.mainContentVisibility = true;
            });
        }

        this.isFocused = !this.isFavoriteForm && !DeviceDetection.isMobile();
    }
    if (this.type === 'location') {
      this.locationService.favoriteLocations$
        .pipe(takeUntil(this.destroy$))
        .subscribe((stars: any[]) => {
          this.pinnablesLoaded = true;
          this.starredChoices = stars.map(val => Location.fromJSON(val));
          if (this.isFavoriteForm) {
              this.choices = [...this.starredChoices, ...this.choices].sort((a, b) => a.id - b.id);
          }
          this.favoritesLoaded = true;
            this.mainContentVisibility = true;
      });
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        filter(() => this.isMobile),
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

      this.updatedLocation$?.pipe(
        takeUntil(this.destroy$),
      ).subscribe(res => this.updateOrAddChoices(res));

  }

  private choiceFunc(loc) {
    return function(choice) {
      if (choice instanceof Location) {
        if (''+choice.id === ''+loc.id) {
          return loc;
        } else {
          return choice;
        }
      } else {
        try {
          const l = Location.fromJSON(choice);
          if (''+l.id === ''+loc.id) {
            return cloneDeep(loc);
          }
        } catch(e) {}
        return cloneDeep(choice);
      }
    }
  }

  // check if modified location exists on choices
  private isFoundChoice(loc: Location, choices: Location[]|any[]) {
    for (let i = 0; i < choices.length; i++) {
      if (choices[i] instanceof Location) {
        if (''+choices[i].id === ''+loc.id) {
          return true;
        }
      } else {
        try {
          const l = Location.fromJSON(choices[i]);
          if (''+l.id === ''+loc.id) {
            return true;
          }
        } catch(e) {}
      }
    }
    return false;
  }

  private updateOrAddChoices(loc: Location) {
    const mapping = this.choiceFunc(loc);
    if (!this.isFoundChoice(loc, this.choices)) {
      this.choices = [cloneDeep(loc), ...this.choices];
    } else {
      this.choices = this.choices.map(mapping);
    }

    if (!loc.starred) {
      return;
    }
    if (!this.isFoundChoice(loc, this.starredChoices)) {
      this.starredChoices = [cloneDeep(loc), ...this.starredChoices];
    } else {
      this.starredChoices = this.starredChoices.map(mapping);
    }
  }

  normalizeLocations(loc) {
    if (this.pinnables && (this.currentPage !== 'from' && !this.isFavoriteForm)) {
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

    // We don't need to restrict the location by pass limit if the location is for later
    if (this.forLater) {
      return loc;
    }

    loc.restricted = loc.restricted || this.passLimitInfo?.current === 0;
    return loc;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateOrderLocation(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.starredChoices, event.previousIndex, event.currentIndex);
    this.onUpdate.emit(this.starredChoices);
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

            this.choices = ((this.searchExceptFavourites && !this.forKioskMode) || !!this.category
                            ? [...this.filterResults(p)]
                            : [...filtFevLoc, ...this.filterResults(p)]).filter(r => {
                              if (this.category) {
                                return this.category === r.category;
                              }
                              return r;
            });
            this.noChoices = !this.choices.length;
          });
      } else {
        if (this.staticChoices && this.staticChoices.length) {
          this.choices = this.staticChoices;
        } else {
          iif(() =>
            !!this.category,
            this.locationService.locsFromCategory$,
            this.locationService.locations$
          )
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => {
              this.choices = res.filter(r => {
                if (this.category) {
                  return r.category === this.category;
                }
                return r;
              });
              this.hideFavorites = false;
              this.noChoices = !this.choices.length;
          });
        }
      }
  }

  isValidLocation(locationId: any) {
    if (this.isFavoriteForm)
      return true;
    else if (+locationId === +this.invalidLocation)
      return false;
    else if (this.forStaff && !this.forKioskMode)
      return true;

    const location = this.passLimits[locationId];
    if (!location)
      return false;

    return this.tooltipService.reachedPassLimit(this.currentPage, location);
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
                return locs;
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
    if (choice.id in this.passLimits) {
      choice['numberOfStudentsInRoom'] = this.passLimits[choice.id].to_count;
    }
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

  getPassLimit(choice: any): PassLimit {
    return this.passLimits ? this.passLimits[choice.id] : null;
  }

}
