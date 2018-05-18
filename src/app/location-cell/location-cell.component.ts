import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Location } from '../NewModels';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.css']
})
export class LocationCellComponent implements OnInit {

  @Input()
  location:Location;

  @Output() onSubSelect:EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  locationSelected(){
    this.onSubSelect.emit(this.location);
  }

}
