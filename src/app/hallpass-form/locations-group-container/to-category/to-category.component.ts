import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocationService } from '../location.service';
import {Navigation} from '../../hallpass-form.component';
import {Pinnable} from '../../../models/Pinnable';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss']
})
export class ToCategoryComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() students;

  @Input() fromLocation;

  @Output() locFromCategory: EventEmitter<any> = new EventEmitter<any>();

  pinnable: Pinnable;

  constructor(private locService: LocationService) { }

  get headerGradient() {
     const colors = this.formState.data.direction.pinnable.gradient_color;
     return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.fromLocation = this.formState.data.direction.from;
    this.pinnable = this.formState.data.direction.pinnable;
  }

  locationChosen(location) {
    this.locFromCategory.emit(location);
  }

  back() {
    this.locService.back();
  }

}
