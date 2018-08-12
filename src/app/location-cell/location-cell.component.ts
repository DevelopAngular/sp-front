import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.scss']
})
export class LocationCellComponent implements OnInit {

  @Input()
  value: Location;

  @Input()
  type: string;

  @Input()
  starred: boolean;

  @Input()
  showStar: boolean;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<any> = new EventEmitter();

  overStar: boolean = false;

  constructor(private http: HttpService) {}

  ngOnInit() {
    this.value.starred = this.starred;
  }

  cellSelected() {
    if(!this.overStar)
      this.onSelect.emit(this.value);
  }

  star(){
    this.value.starred = !this.value.starred;
    this.onStar.emit(this.value);
  }

}
