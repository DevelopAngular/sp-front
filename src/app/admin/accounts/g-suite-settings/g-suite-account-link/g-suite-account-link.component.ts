import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User} from '../../../../models/User';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-g-suite-account-link',
  templateUrl: './g-suite-account-link.component.html',
  styleUrls: ['./g-suite-account-link.component.scss']
})
export class GSuiteAccountLinkComponent implements OnInit {

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

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

  frameMotion$: BehaviorSubject<any>;

  get showSave() {
    return this.users.admins.length || this.users.teachers.length || this.users.students.length || this.users.assistants.length;
  }

  constructor(private formService: CreateFormService) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
