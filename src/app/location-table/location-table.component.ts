import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from '../http-service';
import { Location } from '../models/Location';

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

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<string> = new EventEmitter();

  choices: any[] = [];
  starredChoices: any[] = [];
  search: string = '';

  constructor(private http: HttpService) {
  }

  ngOnInit() {
    if(this.type==='location'){
      let endpoint = 'api/methacton/v1/users/@me/starred';
      this.http.get(endpoint).toPromise().then((stars:any[]) => {
        this.starredChoices = stars.map(val => Location.fromJSON(val));
      });
    }
  }

  onSearch(search: string) {
    this.search = search;
    if(search!==''){
      this.http.get<Paged<Location>>('api/methacton/v1/'
      +(this.type==='teachers'?'users?role=edit_all_hallpass&':('locations'
        +(!!this.category ? ('?category=' +this.category +'&') : '?')
      ))
      +'limit=4'
      +'&search=' +search
      +(this.type==='location'?'&starred=false':''))
      .toPromise().then(p => {
        this.choices = p.results;
      });
    } else{
      this.choices = [];
      this.search = '';
    }
  }

  choiceSelected(choice: any) {
    this.onSelect.emit(choice);
  }

  star(event){
    if(event.starred){
      this.addLoc(event, this.starredChoices);
    } else{
      //this.removeLoc(event, this.starredChoices);
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
