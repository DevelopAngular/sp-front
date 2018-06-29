import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../NewModels';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.scss']
})
export class LocationCellComponent implements OnInit {

  @Input()
  value: any;

  @Input()
  type: string;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {

  }

  cellSelected() {
    this.onSelect.emit(this.value);
  }

}
