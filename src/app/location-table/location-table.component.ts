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
  styleUrls: ['./location-table.component.css']
})

export class LocationTableComponent implements OnInit {

  @Input()
  category: string;

  @Input()
  placeholder: string;

  @Input()
  type: string;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  public choices: any[];

  constructor(private http: HttpService) {
  }

  ngOnInit() {
    console.log('[Table Type]: ', this.type);
    // TODO Get favorites
    this.http.get<Paged<Location>>('api/methacton/v1/'
      +(this.type==='teachers'?'users?role=edit_all_hallpass&':('locations'
        +(!!this.category ? ('?category=' + this.category +'&') : '?')
      ))
      +'limit=4')
      .toPromise().then(p => {
      this.choices = p.results;
    });
  }

  onSearch(search: string) {
      this.http.get<Paged<Location>>('api/methacton/v1/'
        +(this.type==='teachers'?'users?role=edit_all_hallpass&':('locations'
          +(!!this.category ? ('?category=' +this.category +'&') : '?')
        ))
        +'limit=4'
        +'&search=' +search)
        .toPromise().then(p => {
          this.choices = p.results;
        });
  }

  choiceSelected(choice: any) {
    this.onSelect.emit(choice);
  }

}