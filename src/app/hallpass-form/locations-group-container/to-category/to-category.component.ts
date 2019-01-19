import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss']
})
export class ToCategoryComponent implements OnInit {

  @Input() pinnable;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() students;

  @Input() fromLocation;

  @Output() locFromCategory: EventEmitter<any> = new EventEmitter<any>();

  constructor(private locService: LocationService) { }

  get headerGradient() {
     const colors = this.pinnable.gradient_color;
     return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
  }

  locationChosen(location) {
    this.locFromCategory.emit(location);
  }

  back() {
    this.locService.changeLocation$.next('toWhere');
  }

}
