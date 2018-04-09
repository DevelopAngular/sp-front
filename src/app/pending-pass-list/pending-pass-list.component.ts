import { Component, OnInit } from '@angular/core';
import {PendingPass} from '../models';
import {HttpService} from '../http-service';
import {DataService} from '../data-service';

@Component({
  selector: 'app-pending-pass-list',
  templateUrl: './pending-pass-list.component.html',
  styleUrls: ['./pending-pass-list.component.css']
})
export class PendingPassListComponent implements OnInit {
  public pendingPasses:Promise<PendingPass[]>;
  barer;
  constructor(private http:HttpService, private dataService:DataService) { }

  ngOnInit() {
    this.dataService.barerService.subscribe(barer => this.barer = barer);
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    this.pendingPasses = this.http.get<PendingPass[]>('api/methacton/v1/pending_passes', config).toPromise();
  }

}
