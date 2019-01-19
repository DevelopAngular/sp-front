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

  showFullFooter: boolean;

  constructor(private locService: LocationService) { }

  get showDate() {
    if (!this.date) {
      return false;
    } else {
      return Util.formatDateTime(new Date(this.date));
    }
  }

  ngOnInit() {
  }

  locationChosen(location) {
    this.selectedLocation.emit(location);
  }

  back() {
    this.locService.changeLocation$.next('date');
  }

}
