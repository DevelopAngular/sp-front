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

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();

  public pinnables: Promise<Pinnable[]>;

  constructor(private http: HttpService, private locService: LocationService) { }

  ngOnInit() {
    this.pinnables = this.http.get<any[]>('v1/pinnables/arranged').toPromise().then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  pinnableSelected(pinnable) {
    this.selectedPinnable.emit(pinnable);
  }

  back() {
    this.locService.changeLocation$.next('from');
  }

}
