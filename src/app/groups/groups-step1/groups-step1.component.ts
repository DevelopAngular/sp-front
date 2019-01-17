import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';

@Component({
  selector: 'app-groups-step1',
  templateUrl: './groups-step1.component.html',
  styleUrls: ['./groups-step1.component.scss']
})
export class GroupsStep1Component implements OnInit {

  @Output('studentsSelected')
  stagePassedEvent: EventEmitter<{ nextStep: number, data: User[]}> = new EventEmitter<{ nextStep: number, data: User[]}>();

  public selectedStudents: User[] = [];

  constructor() { }

  ngOnInit() {
  }

  nextStep() {
  this.stagePassedEvent.emit({
    nextStep: 2,
    data: this.selectedStudents
  });
  }

}
