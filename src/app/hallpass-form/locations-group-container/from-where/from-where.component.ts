import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LocationService} from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit {

  @Input() date;

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Input() studentText;

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
