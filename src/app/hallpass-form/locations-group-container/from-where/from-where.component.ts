import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LocationService} from '../location.service';
import {Util} from '../../../../Util';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit {

  @Input() date;

  @Input() isStaff: boolean;

  @Input() students;

  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();

  constructor(private locService: LocationService) { }

  ngOnInit() {
  }

  locationChosen(location) {
    this.selectedLocation.emit(location);
  }

  back() {
    this.locService.back();
  }

}
