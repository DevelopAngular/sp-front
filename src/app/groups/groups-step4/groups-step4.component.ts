import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {StudentList} from '../../models/StudentList';

@Component({
  selector: 'app-groups-step4',
  templateUrl: './groups-step4.component.html',
  styleUrls: ['./groups-step4.component.scss']
})
export class GroupsStep4Component implements OnInit {


  @Input() groupList: StudentList[];

  @Output()
  stagePassedEvent: EventEmitter<{ nextStep: number, data: User[]}> = new EventEmitter<{ nextStep: number, data: User[]}>();

  constructor() { }

  ngOnInit() {
  }

  // nextStep() {
  //   this.stagePassedEvent.emit({
  //     nextStep: 2,
  //     data: this.selectedStudents
  //   });
  // }

  editRoom(group) {
    this.stagePassedEvent.emit({
      nextStep: 3,
      data: group
    });
  }

}
