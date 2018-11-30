import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpService } from '../../http-service';
import { Paged } from '../../models';
import { Location } from '../../models/Location'

@Component({
  selector: 'app-location-search',
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.scss']
})
export class LocationSearchComponent implements OnInit {

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Input() showOptions: boolean = true;
  @Input() selectedLocations: Location[] = [];

  locations: Promise<any[]>;
  inputValue: string = '';

  constructor(private http: HttpService) {
    // this.onSearch('');
  }

  ngOnInit(){

  }

  onSearch(search: string) {
    if(search!=='')
      this.locations = this.http.get<Paged<any>>('v1/locations?limit=5' + (search === '' ? '' : '&search=' + encodeURI(search))).toPromise().then(paged => this.removeDuplicateLocations(paged.results));
    else
      this.locations = null;
      this.inputValue = '';
  }

  removeLocation(location: Location) {
    var index = this.selectedLocations.indexOf(location, 0);
    if (index > -1) {
      this.selectedLocations.splice(index, 1);
    }
    this.onUpdate.emit(this.selectedLocations);
    this.onSearch('');
  }

  addLocation(location: Location) {
    console.log(location);
    this.inputValue = '';
    this.onSearch('');
    if (!this.selectedLocations.includes(location)) {
      this.selectedLocations.push(location);
      this.onUpdate.emit(this.selectedLocations);
    }
  }

  removeDuplicateLocations(locations): Location[] {
    let fixedLocations: Location[] = locations;
    let locationsToRemove: Location[] = [];
    for (let selectedLocation of this.selectedLocations) {
      for (let location of fixedLocations) {
        if (selectedLocation.id === location.id) {
          locationsToRemove.push(location);
        }
      }
    }

    for (let locationToRemove of locationsToRemove) {
      var index = fixedLocations.indexOf(locationToRemove, 0);
      if (index > -1) {
        fixedLocations.splice(index, 1);
      }
    }

    return fixedLocations;
  }

}
