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

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    let tracker = event.target;

    let limit = tracker.scrollHeight - tracker.clientHeight;
    if (event.target.scrollTop < limit) {
      this.leftShadow = true;
    }
    if (event.target.scrollTop === limit) {
      this.leftShadow = false;
    }
    if (event.target.scrollTop === limit && this.nextChoices) {
        this.locationService.searchLocationsWithConfig(this.nextChoices)
      .pipe(finalize(() => this.leftShadow = true))
        .toPromise().then(p => {
          p.results.map(element => this.choices.push(element));
          this.nextChoices = p.next;
        });
    }
  }

  @HostListener('scroll', ['$event'])
  leftScroll(event) {
      const tracker = event.target;
      const limit = tracker.scrollHeight - tracker.clientHeight;
      if (event.target.scrollTop < limit) {
          this.rightShadow = true;
      }
      if (event.target.scrollTop === limit) {
          this.rightShadow = false;
      }
  }

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
      this.noChoices = !!this.choices.length;
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
                    this.noChoices = !!this.choices.length;
                  this.mainContentVisibility = true;

                });
        } else if (this.forKioskMode) {
            this.locationService.searchLocationsWithConfig(url)
                .toPromise().then(res => {
                    this.choices = res.results.filter(loc => !loc.restricted);
                    this.noChoices = !!this.choices.length;
            });
        } else {
            this.locationService.searchLocationsWithConfig(url)
                .toPromise().then(p => {
                  this.choices = p.results;
                  this.nextChoices = p.next;
                  this.noChoices = !!this.choices.length;
                  this.mainContentVisibility = true;
            });
        }

        this.isFocused = this.locationService.focused.value;
    }
    if (this.type==='location'){
      this.locationService.getFavoriteLocations().toPromise().then((stars: any[]) => {

        this.starredChoices = stars.map(val => Location.fromJSON(val));
        if (this.isFavoriteForm) {
            this.choices = [...this.starredChoices, ...this.choices].sort((a, b) => a.id - b.id);
        }
        if (this.forKioskMode) {
          this.choices = this.choices.filter(loc => !loc.restricted);
          this.noChoices = !!this.choices.length;
        }
          this.favoritesLoaded = true;
          this.mainContentVisibility = true;
      });
    }

  }

  updateOrderLocation(locations) {
    return;
    const body = {'locations': locations.map(loc => loc.id)};
    this.locationService.updateFavoriteLocations(body).subscribe((res: number[]) => {
      this.onUpdate.emit(res);
    });
  }


  onSearch(search: string) {
    // this.noChoices = false;
    this.search = search.toLowerCase();
    // if(this.staticChoices){
    //   this.choices = this.staticChoices.filter(element => {return (element.display_name.toLowerCase().includes(search) || element.first_name.toLowerCase().includes(search) || element.last_name.toLowerCase().includes(search))})
    // } else{
      if (search !== '') {
        const url = 'v1/'
            +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
                +(!!this.category ? ('?category=' +this.category +'&') : '?')
            ))
            +'limit=100'
            +'&search=' +search
            +((this.type==='location' && this.showFavorites)?'&starred=false':'');

        this.locationService.searchLocationsWithConfig(url)
          .pipe(
            map((locs: any) => {
              if (this.forKioskMode) {
                return {results: locs.results.filter(loc => !loc.restricted)};
              } else {
                return locs;
              }
            })
          )
          .toPromise()
          .then(p => {
            // debugger

            this.hideFavorites = true;
              const filtFevLoc = _.filter(this.starredChoices, (item => {
                  return item.title.toLowerCase().includes(this.search);
              }));
            // this.staticChoices = null;
            this.choices = this.searchExceptFavourites || this.forKioskMode
                            ? [...this.filterResults(p.results)]
                            : [...filtFevLoc, ...this.filterResults(p.results)];
          })
          .then(() => {
            this.noChoices = !!this.choices.length;
          });
      } else {
        if (this.staticChoices && this.staticChoices.length) {
          this.choices = this.staticChoices;
        } else {
          const url = 'v1/'
              +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
                  +(!!this.category ? ('?category=' +this.category +'&') : '?')
              ))
              +'limit=1000'
              +(this.type==='location'?'&starred=false':'');
          if (this.mergedAllRooms) {
            this.mergeLocations(url, this.withMergedStars)
                .pipe(
                  map((locs: any) => {
                    if (this.forKioskMode) {
                      return {results: locs.results.filter(loc => !loc.restricted)};
                    } else {
                      return locs;
                    }
                  })
                )
                .subscribe(res => {
                  this.choices = res;
                  this.hideFavorites = false;
                  this.noChoices = !!this.choices.length;
                });
          } else {
              this.locationService.searchLocationsWithConfig(url)
                .pipe(
                  map((locs: any) => {

                    if (this.forKioskMode) {
                      return {results: locs.results.filter(loc => !loc.restricted)};
                    } else {
                      return locs;
                    }
                  })
                )
                .toPromise()
                .then(p => {

                  if (this.staticChoices) {
                        this.choices = this.filterResults(this.staticChoices);
                    } else {
                        this.hideFavorites = false;

                        this.choices = this.forKioskMode ?_.uniqBy(p.results, 'id') : _.uniqBy([...p.results, ...this.starredChoices], 'id');
                    }
                    this.nextChoices = p.next;
                    this.search = '';
                })
                .then(() => {
                  this.noChoices = !!this.choices.length;
                });
          }
        }
      }
    // }

  }

  mergeLocations(url, withStars: boolean) {
    return combineLatest(
        this.locationService.searchLocationsWithConfig(url),
        this.locationService.getFavoriteLocations()
    )
        .pipe(
            map(([rooms, favorites]: [any, any[]]) => {
              if (withStars) {
                return _.sortBy([...rooms.results, ...favorites], (item) => {
                    return item.title.toLowerCase();
                });
              } else {
                return [...rooms.results];
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
    console.log(index)
    if (index > -1) {
      console.log(index)
      array.splice(index, 1);
    }
  }

}
