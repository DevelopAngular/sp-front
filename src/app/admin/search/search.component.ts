import { Component, OnInit } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { ColorProfile } from '../../models/ColorProfile';
import { HttpService } from '../../http-service';
import * as _ from 'lodash';
import {filter, finalize, map} from 'rxjs/operators';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  testPinnable1:Pinnable;
  testPinnable2:Pinnable;
  testPinnable3:Pinnable;
  testPinnables:Pinnable[] = [];
  testProfile:ColorProfile;

  tableData;
  passes$;
  selectedStudents;
  selectedDate;
  selectedRooms;
  selectedReport = [];

  hasSearched: boolean = false;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.passes$ = this.httpService.get('v1/hall_passes');
    // this.testProfile = new ColorProfile('', 'testing', '#3D56F7,#A957F0', '#A957F1', '', '#A957F0', '');
    // this.testPinnable1 = new Pinnable('1', 'Testing1', '', 'https://storage.googleapis.com/courier-static/icons/Bathroom.png', '', null, null, this.testProfile);
    // this.testPinnable2 = new Pinnable('2', 'Testing2', '', 'https://storage.googleapis.com/courier-static/icons/Office.png', '', null, null, this.testProfile);
    // this.testPinnable3 = new Pinnable('3', 'Testing3', '', 'https://storage.googleapis.com/courier-static/icons/Gym.png', '', null, null, this.testProfile);
    // this.testPinnables.push(this.testPinnable1);
    // this.testPinnables.push(this.testPinnable2);
    // this.testPinnables.push(this.testPinnable3);
  }

  search() {
    if (this.selectedStudents) {
        this.passes$.pipe(filter(res => !!this.selectedStudents), map((passes: any[]) => {
            const studentIds = this.selectedStudents.map(student => student.id);
            return passes.filter(pass => {
                return pass.student.id === studentIds.find(id => id === pass.student.id);
            });
        }), map((passes: any[]) => {
            return passes.map(pass => {
                return {
                    'Student Name': pass.student.first_name + ' ' + pass.student.last_name,
                    'Origin': pass.origin.title,
                    'Destination': pass.destination.title,
                    'TravelType': 'type',
                    'Date & Time': pass.created,
                    'Duration': pass.destination.max_allowed_time
                };
            });
        }), finalize(() => this.hasSearched = true)).subscribe(res => this.tableData = res);
    }
  }

}
