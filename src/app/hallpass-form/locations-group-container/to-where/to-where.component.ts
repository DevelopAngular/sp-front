import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../models/Pinnable';
import { HttpService } from '../../../http-service';
import { LocationService } from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {

  @Input() location;

  @Input() formState: Navigation;

  @Input() pinnables: Promise<Pinnable[]>;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() studentText;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpService, private locService: LocationService) { }

  ngOnInit() {
    this.location = this.formState.data.direction.from;
  }

  pinnableSelected(pinnable) {
    this.selectedPinnable.emit(pinnable);
  }

  back() {
    this.locService.back();
  }

}
