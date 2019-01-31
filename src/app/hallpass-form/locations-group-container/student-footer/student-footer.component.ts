import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  @Output() changeLocation: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  fromLocation: Location;
  toLocation: Location;

  constructor() { }

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
    this.formState.previousState = this.formState.state;
    this.formState.state = 1;
    this.changeLocation.emit(this.formState);
  }

  goToToWhere() {
    if (this.state === 'to' || this.state === 'from') {
      return false;
    }
    this.formState.previousState = this.formState.state;
    this.formState.state = 2;
    this.changeLocation.emit(this.formState);
  }

  goToDate() {
    this.formState.previousState = this.formState.state;
    this.formState.step = 1;
    this.formState.state = 1;
    this.formState.previousStep = 3;
    this.changeLocation.emit(this.formState);
  }

}
