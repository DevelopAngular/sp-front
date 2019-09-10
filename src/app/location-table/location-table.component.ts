import { Component, EventEmitter, Input, OnInit, Output, Directive, HostListener } from '@angular/core';
import { HttpService } from '../services/http-service';
import { Location } from '../models/Location';
import {finalize, map} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {combineLatest} from 'rxjs';
import * as _ from 'lodash';


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

export class LocationTableComponent implements OnInit {

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

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<string> = new EventEmitter();
  @Output() onUpdate: EventEmitter<number[]> = new EventEmitter<number[]>();

  leftShadow: boolean = true;
  rightShadow: boolean = true;

  choices: any[] = [];
  noChoices:boolean = false;
  mainContentVisibility: boolean = false;
  starredChoices: any[] = [];
  search: string = '';
  nextChoices: string = '';
  favoritesLoaded: boolean;
  hideFavorites: boolean;

  selectedLocId: any[] = [];

  isFocused: boolean;

  // @HostListener('scroll', ['$event'])
  // onScroll(event) {
  //   let tracker = event.target;
  //
  //   let limit = tracker.scrollHeight - tracker.clientHeight;
  //   if (event.target.scrollTop < limit) {
  //     this.leftShadow = true;
  //   }
  //   if (event.target.scrollTop === limit) {
  //     this.leftShadow = false;
  //   }
  //   if (event.target.scrollTop === limit && this.nextChoices) {
  //       this.locationService.searchLocationsWithConfig(this.nextChoices)
  //     .pipe(finalize(() => this.leftShadow = true))
  //       .toPromise().then(p => {
  //         p.results.map(element => this.choices.push(element));
  //         this.nextChoices = p.next;
  //       });
  //   }
  // }
  //
  // @HostListener('scroll', ['$event'])
  // leftScroll(event) {
  //     const tracker = event.target;
  //     const limit = tracker.scrollHeight - tracker.clientHeight;
  //     if (event.target.scrollTop < limit) {
  //         this.rightShadow = true;
  //     }
  //     if (event.target.scrollTop === limit) {
  //         this.rightShadow = false;
  //     }
  // }

  constructor(
      private http: HttpService,
      private locationService: LocationsService
  ) {
  }

  ngOnInit() {
    if (!this.locationService.focused.value) {
      this.locationService.focused.next(true);
    }

    if (this.staticChoices && this.staticChoices.length) {
      this.choices = this.staticChoices;
      this.noChoices = !this.choices.length;
      this.mainContentVisibility = true;
    } else {
        const url = 'v1/'
            +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
                +(!!this.category ? ('?category=' +this.category +'&') : '?')
            ))
            +'limit=1000'
            +((this.type==='location' && this.showFavorites)?'&starred=false':'');
        if (this.mergedAllRooms) {
            this.mergeLocations(url, this.withMergedStars)
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
            this.locationService.getLocationsWithConfigRequest(url)
                .subscribe(p => {
                  this.choices = p;
                  this.noChoices = !this.choices.length;
                  this.mainContentVisibility = true;
            });
        }

        this.isFocused = this.locationService.focused.value;
    }
    if (this.type === 'location') {
      this.locationService.getFavoriteLocationsRequest().subscribe((stars: any[]) => {
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
              const filtFevLoc = _.filter(this.starredChoices, (item => {
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
          this.locationService.locations$.subscribe(res => {
            this.choices = res;
            this.hideFavorites = false;
            this.noChoices = !this.choices.length;
          });
          // const url = 'v1/'
          //     +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
          //         +(!!this.category ? ('?category=' +this.category +'&') : '?')
          //     ))
          //     +'limit=1000'
          //     +(this.type==='location'?'&starred=false':'');
          // if (this.mergedAllRooms) {
          //   this.mergeLocations(url, this.withMergedStars)
          //       .pipe(
          //         map((locs: any) => {
          //           if (this.forKioskMode) {
          //             return locs.filter(loc => !loc.restricted);
          //           } else {
          //             return locs;
          //           }
          //         })
          //       )
          //       .subscribe(res => {
          //         this.choices = res;
          //         this.hideFavorites = false;
          //         this.noChoices = !this.choices.length;
          //
          //       });
          // } else {
          //     this.locationService.getLocationsWithConfigRequest(url)
          //       .pipe(
          //         map((locs: any) => {
          //           if (this.forKioskMode) {
          //             return locs.filter(loc => !loc.restricted);
          //           } else {
          //             return locs;
          //           }
          //         })
          //       )
          //       .subscribe(p => {
          //           if (this.staticChoices) {
          //               this.choices = this.filterResults(this.staticChoices);
          //           } else {
          //               this.hideFavorites = false;
          //               this.choices = _.uniqBy([...p, ...this.starredChoices], 'id');
          //           }
          //           this.noChoices = !this.choices.length;
          //           this.search = '';
          //       });
          // }
        }
      }
    // }

  }

  mergeLocations(url, withStars: boolean) {
    return combineLatest(
        this.locationService.getLocationsWithConfigRequest(url),
        this.locationService.getFavoriteLocationsRequest()
    )
        .pipe(
            map(([rooms, favorites]: [any, any[]]) => {
              if (withStars) {
                return _.sortBy([...rooms, ...favorites], (item) => {
                    return item.title.toLowerCase();
                });
              } else {
                return [...rooms];
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
    if(event.starred){
      this.addLoc(event, this.starredChoices);
    } else{
      this.removeLoc(event, this.starredChoices);
    }
    this.onSearch('');
    this.onStar.emit(event);
    this.search = '';
  }

  addLoc(loc: any, array: any[]){
    if(!array.includes(loc))
      array.push(loc)
  }

  removeLoc(loc: any, array: any[]){
    var index = array.findIndex((element) => element.id === loc.id);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

}
