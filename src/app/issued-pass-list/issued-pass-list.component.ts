import { Component, OnInit } from '@angular/core';
import {PendingPass, User, Location} from '../models';
import { HttpService } from '../http-service';
import { DataService } from '../data-service';
import {JSONSerializer} from '../models';
export interface SelectItem{
  label;
  value;
}

@Component({
  selector: 'app-issued-pass-list',
  templateUrl: './issued-pass-list.component.html',
  styleUrls: ['./issued-pass-list.component.css']
})

export class IssuedPassListComponent implements OnInit {

  pendingPasses: PendingPass[] = [];

  selectedPendingPass: PendingPass;

  displayDialog: boolean;

  sortOptions: SelectItem[];

  sortKey: string;

  sortField: string;

  sortOrder: number;

  barer;

  constructor(private http: HttpService, private dataService: DataService, private serializer: JSONSerializer) { }

  ngOnInit() {
      this.dataService.currentBarer.subscribe(barer => this.barer = barer);
      this.getPendingPasses();

      this.sortOptions = [
          {label: 'Newest First', value: '!year'},
          {label: 'Oldest First', value: 'year'},
          {label: 'Brand', value: 'brand'}
      ];
  }

  selectPendingPass(event: Event, car: PendingPass) {
      this.selectedPendingPass = car;
      this.displayDialog = true;
      event.preventDefault();
  }

  onSortChange(event) {
      const value = event.value;

      if (value.indexOf('!') === 0) {
          this.sortOrder = -1;
          this.sortField = value.substring(1, value.length);
      }
      else {
          this.sortOrder = 1;
          this.sortField = value;
      }
  }

  onDialogHide() {
      this.selectedPendingPass = null;
  }

  getPendingPasses(){
    const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
    this.http.get('api/methacton/v1/pending_passes', config).subscribe((data: any[]) => {
        for (let i = 0; i < data.length; i++){
            this.pendingPasses.push(this.serializer.getPendingPassFromJSON(data[i]));
        }
    });
  }

}
