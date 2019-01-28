import { Component, Input, OnInit } from '@angular/core';
import { Navigation } from '../../hallpass-form.component';
import { Location } from '../../../models/Location';
import {LocationService} from '../location.service';

@Component({
  selector: 'app-student-footer',
  templateUrl: './student-footer.component.html',
  styleUrls: ['./student-footer.component.scss']
})
export class StudentFooterComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() date;

  @Input() state;

  fromLocation: Location;
  toLocation: Location;

  constructor() { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation && (this.state !== 'to' && this.state !== 'category') ? this.toLocation.title : 'Destination';
  }

  ngOnInit() {
    if (this.formState) {
      this.fromLocation = this.formState.data.direction.from;
      this.toLocation = this.formState.data.direction.to;
    }
  }

}
