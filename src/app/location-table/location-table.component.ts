import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from '../http-service';
import { Location } from '../NewModels';

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

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  choices: any[] = [];
  starredChoices: Promise<Location>;
  search: string = '';

  constructor(private http: HttpService) {
  }

  ngOnInit() {
    // console.log('[Table Type]: ', this.type);
    // TODO Get favorites
    this.http.get<Paged<Location>>('api/methacton/v1/'
      +(this.type==='teachers'?'users?role=edit_all_hallpass&':('locations'
        +(!!this.category ? ('?category=' + this.category +'&') : '?')
      ))
      +'limit=4'
      +(this.type==='location'?'&starred=false':''))
      .toPromise().then(p => {
      this.choices = p.results;
    });

    if(this.type==='location'){
      this.updateFavorites();
    }
  }

  onSearch(search: string) {
    this.search = search;
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
  }

  choiceSelected(choice: any) {
    this.onSelect.emit(choice);
  }

  updateFavorites(){
    this.starredChoices = this.http.get<Location>('api/methacton/v1/locations?starred=true').toPromise();
    this.onSearch(this.search);
  }

}