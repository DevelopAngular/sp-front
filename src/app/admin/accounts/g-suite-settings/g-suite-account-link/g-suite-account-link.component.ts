import { Component, OnInit } from '@angular/core';
import {User} from '../../../../models/User';

@Component({
  selector: 'app-g-suite-account-link',
  templateUrl: './g-suite-account-link.component.html',
  styleUrls: ['./g-suite-account-link.component.scss']
})
export class GSuiteAccountLinkComponent implements OnInit {

  users: {
    students: User[],
    teachers: User[],
    admins: User[],
    assistants: User[]
  } = {
    students: [],
    teachers: [],
    admins: [],
    assistants: []
  };

  get showSave() {
    return this.users.admins.length || this.users.teachers.length || this.users.students.length || this.users.assistants.length;
  }

  constructor() { }

  ngOnInit() {
  }

}
