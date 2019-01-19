import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {StudentList} from '../../models/StudentList';
import {Navigation} from '../groups-container/groups-container.component';

@Component({
  selector: 'app-groups-step1',
  templateUrl: './groups-step1.component.html',
  styleUrls: ['./groups-step1.component.scss']
})
export class GroupsStep1Component implements OnInit {

  @Input() groups: StudentList[] = []

  public selectedGroup: StudentList;



  @Output('stateChangeEvent')
  stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public selectedStudents: User[] = [];

  constructor(
  ) { }

  ngOnInit() {

  }

  nextStep() {
    this.stateChangeEvent.emit({
      state: 0,
      fromState: 1,
      data: this.selectedGroup || this.selectedStudents
    });
  }

  createGroup() {
    this.stateChangeEvent.emit({
      state: 2,
      fromState: 1,
      data: this.selectedStudents
    });
  }


  selectGroup(group) {
    if ( !this.selectedGroup || (this.selectedGroup && (this.selectedGroup.id !== group.id)) ) {
      this.selectedGroup = group;
      this.selectedStudents = this.selectedGroup.users;
    } else {
      this.selectedGroup = null;
      this.selectedStudents = [];

    }
  }

  editGroup(group) {
    this.stateChangeEvent.emit({
      state: 3,
      fromState: 1,
      data: group
    });
  }

  back() {
    this.selectedGroup = null;
    this.selectedStudents = [];
  }
}


