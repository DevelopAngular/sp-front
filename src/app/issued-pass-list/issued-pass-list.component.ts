import { Component, OnInit } from '@angular/core';
import {PendingPass, User, Location} from '../models';
import { HttpService } from '../http-service';
import { DataService } from '../data-service';

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

  pendingPasses: PendingPass[];

  selectedPendingPass: PendingPass;

  displayDialog: boolean;

  sortOptions: SelectItem[];

  sortKey: string;

  sortField: string;

  sortOrder: number;

  barer;

  constructor(private http: HttpService, private dataService: DataService) { }

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
      let value = event.value;

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
    let config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    this.http.get("api/methacton/v1/pending_passes", config).subscribe((data:any[])=>{
      for(let i = 0; i<data.length;i++){
        let students:User[];
        let studentsJSON = data[i]['students'];
        for(let j = 0; j<studentsJSON.length;j++){
            let id = studentsJSON[i]['id'];
            let display_name = studentsJSON[i]['display_name'];
            students.push(new User(id, display_name));
        }

        let description = data[i]['description'];

        let id = data[i]['to_location']['id'];
        let toName = data[i]['to_location']['name'];
        let campus = data[i]['to_location']['campus'];
        let room = data[i]['to_location']['room'];
        let teachers:User[];
        let teachersJSON = data[i]['to_location']['']
        let toLocation:Location = new Location(id, toName, campus, room, teachers);

        let duration;
        let startTime;
        let fromLocation:Location;
        let endTime;
        let issuer:User;
        let authorities:User[];
        this.pendingPasses.push(new PendingPass(students, description, toLocation, duration, startTime, fromLocation, endTime, issuer, authorities));
      }
    });
  }

}
