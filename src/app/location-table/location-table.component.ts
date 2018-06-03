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

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  @Input()
  category: string;

  public locations: Location[];

  constructor(private http: HttpService) {
  }

  ngOnInit() {
    // TODO Get favorites
    this.http.get<Paged<Location>>('api/methacton/v1/locations'
      + (!!this.category ? ('?limit=4&category=' + this.category) : ''))
      .toPromise().then(p => {
      this.locations = p.results;
    });
  }

  onSearch(search: string) {
    this.http.get<Paged<Location>>('api/methacton/v1/locations?limit=4&' +
      +(!!this.category ? ('limit=5&category=' + this.category) : '')
      + '&search=' + search)
      .toPromise().then(p => {
      this.locations = p.results;
    });
  }

  locationSelected(location: Location) {
    this.onSelect.emit(location);
  }

}
