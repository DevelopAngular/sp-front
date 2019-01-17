import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-groups-step2',
  templateUrl: './groups-step2.component.html',
  styleUrls: ['./groups-step2.component.scss']
})
export class GroupsStep2Component implements OnInit {

  @Input() selectedStudents: User[] = [];
  @Input() form: FormGroup;
  constructor() { }

  ngOnInit() {
  }
  nextStep() {

  }
}
