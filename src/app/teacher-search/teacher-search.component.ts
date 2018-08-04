import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DataService } from '../data-service';
import { HttpService } from '../http-service';

import { Location } from '../models/Location';

@Component({
  selector: 'app-teacher-search',
  templateUrl: './teacher-search.component.html',
  styleUrls: ['./teacher-search.component.scss']
})
export class TeacherSearchComponent {
  locations: Location[] = [];
  _selectedLocation: Location;

  @Input()
  type: string;

  @Output()
  locationSelectedEvent: EventEmitter<Location> = new EventEmitter();

  constructor(private http: HttpService, private dataService: DataService) {
  }

  get typeString(): string {
    return this.type === '\'to\'' ? 'Destination' : 'Origin';
  }

  set selectedLocation(loc: Location) {
    this._selectedLocation = loc;
    this.locationSelectedEvent.emit(loc);
  }

  async updateLocations(event) {
    const query = event.query;
    this.locations = this.convertToLocations(await this.filterLocations(query));
  }

  filterLocations(name: string): Promise<any[]> {
    return this.http.get<any[]>('api/methacton/v1/locations?search=' + encodeURI(name)).toPromise();
  }

  convertToLocations(json: any[]): Location[] {
    const out: Location[] = [];
    for (let i = 0; i < json.length; i++) {
      out.push(Location.fromJSON(json[i]));
    }
    return out;
  }

  validate() {
    return this._selectedLocation instanceof Location;
  }

  getIcon() {
    return this.validate() ? 'fa-check' : 'fa-close';
  }
}
