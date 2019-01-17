import { Component, OnInit } from '@angular/core';
import {Pinnable} from '../../../models/Pinnable';
import {HttpService} from '../../../http-service';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {

  public pinnables: Promise<Pinnable[]>;

  constructor(private http: HttpService) { }

  ngOnInit() {
    this.pinnables = this.http.get<any[]>('v1/pinnables/arranged').toPromise().then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  pinnableSelected(pinnable) {
  }

}
