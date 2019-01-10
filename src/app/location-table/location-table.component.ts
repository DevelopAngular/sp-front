import { Component, EventEmitter, Input, OnInit, Output, Directive, HostListener } from '@angular/core';
import { HttpService } from '../http-service';
import { Location } from '../models/Location';
import {finalize} from 'rxjs/operators';

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

  @Input()
  category: string;

  @Input()
  placeholder: string;

  @Input()
  type: string;

  @Input()
  showStars: string;

  @Input()
  showFavorites: boolean;

  @Input()
  staticChoices: any[];

  @Input()
  forStaff: boolean;

  @Input()
  forLater: boolean;

  @Input()
  hasLocks: boolean;

  @Input()
  invalidLocation: string;

  @Input()
  noRightStar: boolean;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<string> = new EventEmitter();

  leftShadow: boolean = true;
  rightShadow: boolean = true;

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
      this.http.get<Paged<Location>>(this.nextChoices).pipe(finalize(() => this.leftShadow = true))
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
  choices: any[] = [];
  starredChoices: any[] = [];
  search: string = '';
  nextChoices: string = '';
  favoritesLoaded: boolean;
  constructor(private http: HttpService) {
  }

  ngOnInit() {
    if(this.staticChoices){
      this.choices = this.staticChoices;
    } else{
      this.http.get<Paged<Location>>('v1/'
        +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
          +(!!this.category ? ('?category=' +this.category +'&') : '?')
        ))
        +'limit=10'
        +(this.type==='location'?'&starred=false':''))
        .toPromise().then(p => {
          this.choices = p.results;
          this.nextChoices = p.next;
        });
    }
    if(this.type==='location'){
      let endpoint = 'v1/users/@me/starred';
      this.http.get(endpoint).toPromise().then((stars:any[]) => {
        this.starredChoices = stars.map(val => Location.fromJSON(val));
        this.favoritesLoaded = true;
      });
    }
  }

  onSearch(search: string) {
    this.search = search.toLowerCase();
    // if(this.staticChoices){
    //   this.choices = this.staticChoices.filter(element => {return (element.display_name.toLowerCase().includes(search) || element.first_name.toLowerCase().includes(search) || element.last_name.toLowerCase().includes(search))})
    // } else{
      if(search!==''){
        this.http.get<Paged<Location>>('v1/'
        +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
          +(!!this.category ? ('?category=' +this.category +'&') : '?')
        ))
        +'limit=4'
        +'&search=' +search
        +(this.type==='location'?'&starred=false':''))
        .toPromise().then(p => {
          this.choices = this.filterResults(p.results);
        });
      } else{
        this.http.get<Paged<Location>>('v1/'
        +(this.type==='teachers'?'users?role=_profile_teacher&':('locations'
          +(!!this.category ? ('?category=' +this.category +'&') : '?')
        ))
        +'limit=10'
        +(this.type==='location'?'&starred=false':''))
        .toPromise().then(p => {
          this.choices = this.filterResults(p.results);
          this.nextChoices = p.next;
          this.search = '';
        });
      }
    // }
  }

  filterResults(results: any[]){
    return results.filter(felement => {
      return this.starredChoices.findIndex((ielement) => {
        return ielement.id === felement.id;
      }) < 0;
    });
  }

  choiceSelected(choice: any) {
    this.onSelect.emit(choice);
  }

  star(event){
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
