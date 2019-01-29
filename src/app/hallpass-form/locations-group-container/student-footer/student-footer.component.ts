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

  constructor(private locService: LocationService) { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation && (this.state !== 'to' && this.state !== 'category') ? this.toLocation.title : 'Destination';
  }

  get fromCursor() {
    return this.state !== 'from';
  }

  get toCursor() {
    return this.state !== 'to' && this.state !== 'from';
  }

  ngOnInit() {
    if (this.formState) {
      this.fromLocation = this.formState.data.direction.from;
      this.toLocation = this.formState.data.direction.to;
    }
  }

  goToFromWhere() {
    if (this.state === 'from') {
      return false;
    }
    this.locService.nextStep('from');
  }

  goToToWhere() {
    if (this.state === 'to' || this.state === 'from') {
      return false;
    }
    this.locService.nextStep('toWhere');
  }

}
