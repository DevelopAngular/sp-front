import { Component, OnInit } from '@angular/core';
import {GroupsHistoryManagerService} from '../groups-history-manager.service';
import {User} from '../../models/User';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-groups-container',
  templateUrl: './groups-container.component.html',
  styleUrls: ['./groups-container.component.scss']
})
export class GroupsContainerComponent implements OnInit {

  selectedStudents: User[] = [];
  groupDTO: FormGroup;
  steps: Map<number, string>;
  form: any;

  constructor() {

    this.steps = new Map<number, string>();
    this.steps.set(1, 'select students');
    this.steps.set(2, 'create group');
    this.steps.set(3, 'edit group');
    this.steps.set(4, 'select students');
    this.steps.set(5, 'select students');
    this.steps.set(6, 'select students');

    this.groupDTO = new FormGroup({
      title: new FormControl('name'),
      users: new FormControl(this.selectedStudents),
    });
  }

  ngOnInit() {
    // this.selectedStudents = GroupsHistoryManagerService.getSelectedStudents();
  }

  onStudentsSelected(evt) {
    // GroupsHistoryManagerService.setSelectedStudents(evt);
    this.selectedStudents = evt.data;
    this.groupDTO.get('users').setValue(evt.data);
    console.log('======>', this.groupDTO.value);

  }
}
