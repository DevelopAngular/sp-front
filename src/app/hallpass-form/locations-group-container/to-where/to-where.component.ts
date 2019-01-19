import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../models/Pinnable';
import { HttpService } from '../../../http-service';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {

  @Input() location;

  @Input() pinnables: Promise<Pinnable[]>;

  @Input() isStaff: boolean;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpService, private locService: LocationService) { }

  ngOnInit() {
  }

  pinnableSelected(pinnable) {
    this.selectedPinnable.emit(pinnable);
  }

  back() {
    this.locService.changeLocation$.next('from');
  }

}
