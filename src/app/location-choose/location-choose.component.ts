import { Component, OnInit } from '@angular/core';
import { Location } from '../models/Location';

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
