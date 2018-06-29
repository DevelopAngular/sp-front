import { Component, OnInit } from '@angular/core';
import { Location } from '../NewModels';

@Component({
  selector: 'app-location-choose',
  templateUrl: './location-choose.component.html',
  styleUrls: ['./location-choose.component.scss']
})
export class LocationChooseComponent implements OnInit {
  selectedLocation: Location;

  constructor() {
  }

  ngOnInit() {
  }

}
