import { Component, Input, OnInit } from '@angular/core';
import { LocationsService } from '../services/locations.service';

@Component({
  selector: 'app-rooms-search',
  templateUrl: './rooms-search.component.html',
  styleUrls: ['./rooms-search.component.scss']
})
export class RoomsSearchComponent implements OnInit {

  @Input() width: string = '280px';
  @Input() placeholder: string;

  allRooms;

  constructor(private locationService: LocationsService) { }

  ngOnInit() {
    this.locationService.searchLocationsWithConfig('v1/locations?limit=1000&starred=false')
        .subscribe(res => {
          this.allRooms = res.results;
          debugger;
        });
  }

  onSearch(search) {

  }

}
