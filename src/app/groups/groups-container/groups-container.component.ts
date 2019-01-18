import { Component, OnInit } from '@angular/core';
import {GroupsHistoryManagerService} from '../groups-history-manager.service';
import {User} from '../../models/User';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {StudentList} from '../../models/StudentList';
import {HttpService} from '../../http-service';
import {BehaviorSubject} from 'rxjs';


export interface Navigation {
  state: number;
  fromState: number;
  data: User[]|StudentList;
}

export enum States {
  SelectStudents = 1,
  CreateGroup = 2,
  EditGroup = 3
}


@Component({
  selector: 'app-groups-container',
  templateUrl: './groups-container.component.html',
  styleUrls: ['./groups-container.component.scss']
})




export class GroupsContainerComponent implements OnInit {

  updateData$: BehaviorSubject<null> = new BehaviorSubject<null>(null);

  states;
  currentState: number = 1;
  selectedGroup: StudentList;
  groups: StudentList[];
  selectedStudents: User[] = [];
  groupDTO: FormGroup;


  constructor(
    private http: HttpService
  ) {

    this.states = States;

    this.groupDTO = new FormGroup({
      title: new FormControl(''),
      users: new FormControl(this.selectedStudents),
    });
  }

  ngOnInit() {
    this.updateData$.subscribe(() => {
      this.http.get('v1/student_lists')
        .subscribe((groups: StudentList[]) => {
          this.groups = groups;
        });
    });
  }

  onStudentsSelected(evt) {
    switch ( evt.state ) {
      case (3): {
        this.selectedGroup = evt.data
        break;
      }
      case (2): {
        this.selectedStudents = evt.data;
        this.groupDTO.get('users').setValue(evt.data);
        break;
      }
      case (1): {
        if (evt.fromState === 3) {
          this.selectedGroup = evt.data;
        } else {
          this.selectedStudents = evt.data;
        }
        break;
      }
    }
    this.currentState = evt.state;
    this.updateData$.next(null);
  }
}
